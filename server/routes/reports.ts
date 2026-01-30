import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getDistance } from '../services/geo.js';

const router = Router();
const prisma = new PrismaClient();

// Get all reports with optional filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, status, lat, lng, radius } = req.query;

    const where: Record<string, unknown> = {};

    if (category && category !== 'all') {
      where.category = category as string;
    }

    if (status && status !== 'all') {
      where.status = status as string;
    }

    const reports = await prisma.report.findMany({
      where,
      include: {
        images: true,
        user: {
          select: { id: true, displayName: true, avatarUrl: true }
        },
        _count: {
          select: { agreements: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Filter by radius if lat/lng provided
    let filteredReports = reports;
    if (lat && lng && radius) {
      const userLat = parseFloat(lat as string);
      const userLng = parseFloat(lng as string);
      const maxRadius = parseFloat(radius as string);

      filteredReports = reports.filter(report => {
        const distance = getDistance(userLat, userLng, report.latitude, report.longitude);
        return distance <= maxRadius;
      });
    }

    res.json(filteredReports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get single report
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        images: true,
        user: {
          select: { id: true, displayName: true, avatarUrl: true }
        },
        agreements: {
          include: {
            user: {
              select: { id: true, displayName: true, avatarUrl: true }
            }
          }
        }
      }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Create new report
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      latitude,
      longitude,
      address,
      imageUrls,
      userId,
      sessionId
    } = req.body;

    if (!title || !description || !category || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!imageUrls || imageUrls.length === 0) {
      return res.status(400).json({ error: 'At least one image is required' });
    }

    const report = await prisma.report.create({
      data: {
        title,
        description,
        category,
        latitude,
        longitude,
        address,
        userId: userId || null,
        sessionId: sessionId || null,
        images: {
          create: imageUrls.map((url: string) => ({ imageUrl: url }))
        }
      },
      include: {
        images: true,
        user: {
          select: { id: true, displayName: true, avatarUrl: true }
        }
      }
    });

    res.status(201).json(report);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

// Delete report
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId, sessionId } = req.body;

    const report = await prisma.report.findUnique({
      where: { id }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Check ownership
    const isOwner = (userId && report.userId === userId) ||
                    (sessionId && report.sessionId === sessionId);

    if (!isOwner) {
      return res.status(403).json({ error: 'Not authorized to delete this report' });
    }

    await prisma.report.delete({
      where: { id }
    });

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

// Agree with a report (neighbourhood verification)
router.post('/:id/agree', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId, sessionId, latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Location is required to agree' });
    }

    const report = await prisma.report.findUnique({
      where: { id }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Calculate distance
    const distance = getDistance(latitude, longitude, report.latitude, report.longitude);
    const MAX_AGREEMENT_DISTANCE = 500; // 500 meters

    if (distance > MAX_AGREEMENT_DISTANCE) {
      return res.status(400).json({
        error: 'You must be within 500 meters of the reported issue to verify it',
        distance: Math.round(distance),
        maxDistance: MAX_AGREEMENT_DISTANCE
      });
    }

    // Check if already agreed
    const existingAgreement = await prisma.agreement.findFirst({
      where: {
        reportId: id,
        OR: [
          { userId: userId || undefined },
          { sessionId: sessionId || undefined }
        ]
      }
    });

    if (existingAgreement) {
      return res.status(400).json({ error: 'You have already agreed with this report' });
    }

    // Create agreement
    const agreement = await prisma.agreement.create({
      data: {
        reportId: id,
        userId: userId || null,
        sessionId: sessionId || null,
        latitude,
        longitude,
        distance
      }
    });

    // Update agreement count
    await prisma.report.update({
      where: { id },
      data: {
        agreementCount: { increment: 1 },
        status: report.agreementCount >= 2 ? 'verified' : report.status
      }
    });

    res.status(201).json(agreement);
  } catch (error) {
    console.error('Error creating agreement:', error);
    res.status(500).json({ error: 'Failed to create agreement' });
  }
});

// Remove agreement
router.delete('/:id/agree', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId, sessionId } = req.body;

    const agreement = await prisma.agreement.findFirst({
      where: {
        reportId: id,
        OR: [
          { userId: userId || undefined },
          { sessionId: sessionId || undefined }
        ]
      }
    });

    if (!agreement) {
      return res.status(404).json({ error: 'Agreement not found' });
    }

    await prisma.agreement.delete({
      where: { id: agreement.id }
    });

    // Update agreement count
    await prisma.report.update({
      where: { id },
      data: {
        agreementCount: { decrement: 1 }
      }
    });

    res.json({ message: 'Agreement removed successfully' });
  } catch (error) {
    console.error('Error removing agreement:', error);
    res.status(500).json({ error: 'Failed to remove agreement' });
  }
});

export default router;
