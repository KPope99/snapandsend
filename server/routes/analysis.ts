import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { analyzeIncidentForAdmin } from '../services/vision.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/analysis/incidents/:id - return cached analysis or 404
router.get('/incidents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cached = await prisma.reportAnalysis.findUnique({ where: { reportId: id } });
    if (!cached) return res.status(404).json({ error: 'No analysis found' });

    return res.json({
      analysis: {
        summary: cached.summary,
        severity: cached.severity,
        assessmentDetails: JSON.parse(cached.assessmentDetails),
        suggestedActions: JSON.parse(cached.suggestedActions),
        estimatedScope: cached.estimatedScope,
        analyzedAt: cached.analyzedAt.toISOString(),
      },
      cached: true,
    });
  } catch (err) {
    console.error('GET analysis error:', err);
    return res.status(500).json({ error: 'Failed to fetch analysis' });
  }
});

// POST /api/analysis/incidents/:id - run (or return cached) AI analysis
router.post('/incidents/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const report = await prisma.report.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!report) return res.status(404).json({ error: 'Incident not found' });
    if (report.images.length === 0) {
      return res.status(400).json({ error: 'No images available for analysis' });
    }

    // Return cached result if available
    const existing = await prisma.reportAnalysis.findUnique({ where: { reportId: id } });
    if (existing) {
      return res.json({
        analysis: {
          summary: existing.summary,
          severity: existing.severity,
          assessmentDetails: JSON.parse(existing.assessmentDetails),
          suggestedActions: JSON.parse(existing.suggestedActions),
          estimatedScope: existing.estimatedScope,
          analyzedAt: existing.analyzedAt.toISOString(),
        },
        cached: true,
      });
    }

    const result = await analyzeIncidentForAdmin(
      report.images.map(img => img.imageUrl),
      {
        title: report.title,
        description: report.description,
        category: report.category,
        address: report.address ?? undefined,
      }
    );

    const saved = await prisma.reportAnalysis.create({
      data: {
        reportId: id,
        summary: result.summary,
        severity: result.severity,
        assessmentDetails: JSON.stringify(result.assessmentDetails),
        suggestedActions: JSON.stringify(result.suggestedActions),
        estimatedScope: result.estimatedScope,
      },
    });

    return res.json({
      analysis: {
        ...result,
        analyzedAt: saved.analyzedAt.toISOString(),
      },
      cached: false,
    });
  } catch (err) {
    console.error('POST analysis error:', err);
    const message = err instanceof Error ? err.message : 'Analysis failed';
    return res.status(500).json({ error: message });
  }
});

export default router;
