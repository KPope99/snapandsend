import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// API Key validation middleware
async function validateApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required',
      message: 'Please provide an API key in the X-API-Key header'
    });
  }

  const partner = await prisma.apiPartner.findUnique({
    where: { apiKey }
  });

  if (!partner || !partner.isActive) {
    return res.status(403).json({
      error: 'Invalid API key',
      message: 'The provided API key is invalid or has been deactivated'
    });
  }

  // Update last used timestamp
  await prisma.apiPartner.update({
    where: { id: partner.id },
    data: { lastUsedAt: new Date() }
  });

  // Attach partner info to request
  (req as any).partner = partner;
  next();
}

// Apply API key validation to all routes
router.use(validateApiKey);

/**
 * GET /api/external/incidents
 * Fetch all incidents with optional filters
 *
 * Query params:
 * - status: pending | verified | resolved
 * - category: pothole | garbage | vandalism | streetlight | drainage | signage | robbery | other
 * - since: ISO date string (fetch incidents created after this date)
 * - lat, lng, radius: Location-based filtering (radius in meters)
 * - limit: Number of results (default 50, max 500)
 * - offset: Pagination offset
 */
router.get('/incidents', async (req: Request, res: Response) => {
  try {
    const {
      status,
      category,
      since,
      lat,
      lng,
      radius,
      limit = '50',
      offset = '0'
    } = req.query;

    const take = Math.min(parseInt(limit as string) || 50, 500);
    const skip = parseInt(offset as string) || 0;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (since) {
      where.createdAt = {
        gte: new Date(since as string)
      };
    }

    const incidents = await prisma.report.findMany({
      where,
      include: {
        images: {
          select: {
            id: true,
            imageUrl: true,
            createdAt: true
          }
        },
        _count: {
          select: { agreements: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip
    });

    // Filter by location if provided
    let filteredIncidents = incidents;
    if (lat && lng && radius) {
      const userLat = parseFloat(lat as string);
      const userLng = parseFloat(lng as string);
      const maxRadius = parseFloat(radius as string);

      filteredIncidents = incidents.filter(incident => {
        const distance = getDistance(userLat, userLng, incident.latitude, incident.longitude);
        return distance <= maxRadius;
      });
    }

    // Get total count for pagination
    const total = await prisma.report.count({ where });

    // Format response
    const formattedIncidents = filteredIncidents.map(incident => ({
      id: incident.id,
      title: incident.title,
      description: incident.description,
      category: incident.category,
      status: incident.status,
      location: {
        latitude: incident.latitude,
        longitude: incident.longitude,
        address: incident.address
      },
      images: incident.images.map(img => ({
        id: img.id,
        url: img.imageUrl,
        createdAt: img.createdAt
      })),
      verificationCount: incident._count.agreements,
      createdAt: incident.createdAt,
      updatedAt: incident.updatedAt,
      investigatingAt: incident.investigatingAt,
      resolvedAt: incident.resolvedAt,
      resolutionNotes: incident.resolutionNotes,
      resolutionEvidence: incident.resolutionEvidence
    }));

    res.json({
      success: true,
      data: formattedIncidents,
      pagination: {
        total,
        limit: take,
        offset: skip,
        hasMore: skip + take < total
      }
    });
  } catch (error) {
    console.error('External API - Get incidents error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch incidents'
    });
  }
});

/**
 * GET /api/external/incidents/:id
 * Fetch a single incident by ID
 */
router.get('/incidents/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const incident = await prisma.report.findUnique({
      where: { id },
      include: {
        images: {
          select: {
            id: true,
            imageUrl: true,
            createdAt: true
          }
        },
        agreements: {
          select: {
            id: true,
            latitude: true,
            longitude: true,
            distance: true,
            createdAt: true
          }
        }
      }
    });

    if (!incident) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Incident not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: incident.id,
        title: incident.title,
        description: incident.description,
        category: incident.category,
        status: incident.status,
        location: {
          latitude: incident.latitude,
          longitude: incident.longitude,
          address: incident.address
        },
        images: incident.images.map(img => ({
          id: img.id,
          url: img.imageUrl,
          createdAt: img.createdAt
        })),
        verifications: incident.agreements.map(a => ({
          id: a.id,
          location: {
            latitude: a.latitude,
            longitude: a.longitude
          },
          distanceFromIncident: a.distance,
          createdAt: a.createdAt
        })),
        verificationCount: incident.agreements.length,
        createdAt: incident.createdAt,
        updatedAt: incident.updatedAt,
        investigatingAt: incident.investigatingAt,
        resolvedAt: incident.resolvedAt,
        resolutionNotes: incident.resolutionNotes,
        resolutionEvidence: incident.resolutionEvidence
      }
    });
  } catch (error) {
    console.error('External API - Get incident error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch incident'
    });
  }
});

/**
 * PATCH /api/external/incidents/:id/status
 * Update incident status (for police/authority systems)
 *
 * Body:
 * - status: pending | verified | resolved | investigating
 * - notes: Optional notes about the status change
 */
router.patch('/incidents/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes, evidenceUrl } = req.body;
    const partner = (req as any).partner;

    const validStatuses = ['pending', 'verified', 'resolved', 'investigating'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const incident = await prisma.report.findUnique({
      where: { id }
    });

    if (!incident) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Incident not found'
      });
    }

    // Prepare update data with timestamps
    const updateData: any = { status };

    // Set timestamp based on new status
    if (status === 'investigating' && incident.status !== 'investigating') {
      updateData.investigatingAt = new Date();
    }
    if (status === 'resolved' && incident.status !== 'resolved') {
      updateData.resolvedAt = new Date();
      if (notes) {
        updateData.resolutionNotes = notes;
      }
      if (evidenceUrl) {
        updateData.resolutionEvidence = evidenceUrl;
      }
    }

    // Update status
    const updatedIncident = await prisma.report.update({
      where: { id },
      data: updateData
    });

    // Log the status change
    await prisma.statusLog.create({
      data: {
        reportId: id,
        previousStatus: incident.status,
        newStatus: status,
        notes: notes || null,
        changedBy: partner.name,
        partnerId: partner.id
      }
    });

    res.json({
      success: true,
      data: {
        id: updatedIncident.id,
        status: updatedIncident.status,
        updatedAt: updatedIncident.updatedAt
      },
      message: `Incident status updated to '${status}'`
    });
  } catch (error) {
    console.error('External API - Update status error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update incident status'
    });
  }
});

/**
 * GET /api/external/incidents/:id/history
 * Get status change history for an incident
 */
router.get('/incidents/:id/history', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const incident = await prisma.report.findUnique({
      where: { id }
    });

    if (!incident) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Incident not found'
      });
    }

    const history = await prisma.statusLog.findMany({
      where: { reportId: id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: history.map(log => ({
        id: log.id,
        previousStatus: log.previousStatus,
        newStatus: log.newStatus,
        notes: log.notes,
        changedBy: log.changedBy,
        createdAt: log.createdAt
      }))
    });
  } catch (error) {
    console.error('External API - Get history error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch incident history'
    });
  }
});

/**
 * GET /api/external/stats
 * Get statistics for incidents
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { since } = req.query;

    const where: any = {};
    if (since) {
      where.createdAt = { gte: new Date(since as string) };
    }

    // Get counts by status
    const statusCounts = await prisma.report.groupBy({
      by: ['status'],
      where,
      _count: true
    });

    // Get counts by category
    const categoryCounts = await prisma.report.groupBy({
      by: ['category'],
      where,
      _count: true
    });

    // Get total count
    const totalCount = await prisma.report.count({ where });

    // Get recent incidents count (last 24 hours)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCount = await prisma.report.count({
      where: {
        ...where,
        createdAt: { gte: last24Hours }
      }
    });

    res.json({
      success: true,
      data: {
        total: totalCount,
        last24Hours: recentCount,
        byStatus: statusCounts.reduce((acc, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {} as Record<string, number>),
        byCategory: categoryCounts.reduce((acc, item) => {
          acc[item.category] = item._count;
          return acc;
        }, {} as Record<string, number>)
      }
    });
  } catch (error) {
    console.error('External API - Get stats error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch statistics'
    });
  }
});

/**
 * POST /api/external/webhooks
 * Register a webhook to receive real-time notifications
 *
 * Body:
 * - url: Webhook URL to receive notifications
 * - events: Array of events to subscribe to (incident.created, incident.verified, incident.status_changed)
 * - secret: Optional secret for webhook signature verification
 */
router.post('/webhooks', async (req: Request, res: Response) => {
  try {
    const { url, events, secret } = req.body;
    const partner = (req as any).partner;

    if (!url) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Webhook URL is required'
      });
    }

    const validEvents = ['incident.created', 'incident.verified', 'incident.status_changed', 'incident.resolved'];
    const selectedEvents = events || validEvents;

    const invalidEvents = selectedEvents.filter((e: string) => !validEvents.includes(e));
    if (invalidEvents.length > 0) {
      return res.status(400).json({
        error: 'Invalid events',
        message: `Invalid events: ${invalidEvents.join(', ')}. Valid events are: ${validEvents.join(', ')}`
      });
    }

    const webhook = await prisma.webhook.create({
      data: {
        partnerId: partner.id,
        url,
        events: selectedEvents,
        secret: secret || null,
        isActive: true
      }
    });

    res.status(201).json({
      success: true,
      data: {
        id: webhook.id,
        url: webhook.url,
        events: webhook.events,
        isActive: webhook.isActive,
        createdAt: webhook.createdAt
      },
      message: 'Webhook registered successfully'
    });
  } catch (error) {
    console.error('External API - Create webhook error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to register webhook'
    });
  }
});

/**
 * GET /api/external/webhooks
 * List registered webhooks
 */
router.get('/webhooks', async (req: Request, res: Response) => {
  try {
    const partner = (req as any).partner;

    const webhooks = await prisma.webhook.findMany({
      where: { partnerId: partner.id }
    });

    res.json({
      success: true,
      data: webhooks.map(wh => ({
        id: wh.id,
        url: wh.url,
        events: wh.events,
        isActive: wh.isActive,
        createdAt: wh.createdAt
      }))
    });
  } catch (error) {
    console.error('External API - List webhooks error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch webhooks'
    });
  }
});

/**
 * DELETE /api/external/webhooks/:id
 * Delete a webhook
 */
router.delete('/webhooks/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const partner = (req as any).partner;

    const webhook = await prisma.webhook.findFirst({
      where: { id, partnerId: partner.id }
    });

    if (!webhook) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Webhook not found'
      });
    }

    await prisma.webhook.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Webhook deleted successfully'
    });
  } catch (error) {
    console.error('External API - Delete webhook error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete webhook'
    });
  }
});

// Haversine formula for distance calculation
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export default router;
