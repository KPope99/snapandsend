import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireStaffAuth, requireAdmin, StaffRequest } from '../middleware/staffAuth.js';

const router = Router();
const prisma = new PrismaClient();

const ALLOWED_SLUGS = ['about', 'how-it-works', 'collaborate', 'fixers', 'help'];

// GET /api/pages/:slug — public
router.get('/:slug', async (req: Request, res: Response) => {
  const { slug } = req.params;
  if (!ALLOWED_SLUGS.includes(slug)) {
    return res.status(404).json({ error: 'Page not found' });
  }
  const page = await prisma.pageContent.findUnique({ where: { slug } });
  if (!page) return res.json({ slug, sections: {} });
  try {
    res.json({ slug, sections: JSON.parse(page.sections), updatedAt: page.updatedAt, updatedBy: page.updatedBy });
  } catch {
    res.json({ slug, sections: {} });
  }
});

// PUT /api/pages/:slug — admin only
router.put('/:slug', requireStaffAuth, requireAdmin, async (req: StaffRequest, res: Response) => {
  const { slug } = req.params;
  if (!ALLOWED_SLUGS.includes(slug)) {
    return res.status(404).json({ error: 'Page not found' });
  }
  const { sections } = req.body;
  if (!sections || typeof sections !== 'object') {
    return res.status(400).json({ error: 'sections object required' });
  }

  // Fetch staff name for audit trail
  const staff = await prisma.staffMember.findUnique({ where: { id: req.staffId } });

  const page = await prisma.pageContent.upsert({
    where: { slug },
    create: { slug, sections: JSON.stringify(sections), updatedBy: staff?.name || req.staffId },
    update: { sections: JSON.stringify(sections), updatedBy: staff?.name || req.staffId },
  });

  res.json({ slug, sections: JSON.parse(page.sections), updatedAt: page.updatedAt, updatedBy: page.updatedBy });
});

export default router;
