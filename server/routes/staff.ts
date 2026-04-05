import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'snapandsend-secret-key';

interface StaffRequest extends Request {
  staffId?: string;
  isAdmin?: boolean;
}

function requireStaffAuth(req: StaffRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { staffId: string; isAdmin: boolean };
    req.staffId = decoded.staffId;
    req.isAdmin = decoded.isAdmin;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

function requireAdmin(req: StaffRequest, res: Response, next: NextFunction) {
  if (!req.isAdmin) return res.status(403).json({ error: 'Admin access required' });
  next();
}

// POST /api/staff/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const staff = await prisma.staffMember.findUnique({ where: { email } });
    if (!staff) return res.status(401).json({ error: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, staff.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ staffId: staff.id, isAdmin: staff.isAdmin }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      token,
      staff: { id: staff.id, name: staff.name, email: staff.email, category: staff.category, isAdmin: staff.isAdmin },
    });
  } catch (err) {
    console.error('Staff login error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/staff/me
router.get('/me', requireStaffAuth, async (req: StaffRequest, res: Response) => {
  try {
    const staff = await prisma.staffMember.findUnique({
      where: { id: req.staffId },
      select: { id: true, name: true, email: true, category: true, isAdmin: true },
    });
    if (!staff) return res.status(404).json({ error: 'Staff not found' });
    return res.json(staff);
  } catch (err) {
    console.error('Staff me error:', err);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// GET /api/staff/members (admin only)
router.get('/members', requireStaffAuth, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const members = await prisma.staffMember.findMany({
      select: { id: true, name: true, email: true, category: true, isAdmin: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    return res.json(members);
  } catch (err) {
    console.error('List staff error:', err);
    return res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// POST /api/staff/members (admin only)
router.post('/members', requireStaffAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, email, password, category } = req.body;
    if (!name || !email || !password || !category) {
      return res.status(400).json({ error: 'Name, email, password and category are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const exists = await prisma.staffMember.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const member = await prisma.staffMember.create({
      data: { name, email, password: hashed, category, isAdmin: false },
      select: { id: true, name: true, email: true, category: true, isAdmin: true, createdAt: true },
    });

    return res.status(201).json(member);
  } catch (err) {
    console.error('Create staff error:', err);
    return res.status(500).json({ error: 'Failed to create staff member' });
  }
});

// PUT /api/staff/members/:id/password (admin can change any; staff can change own)
router.put('/members/:id/password', requireStaffAuth, async (req: StaffRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Must be admin or changing own password
    if (!req.isAdmin && req.staffId !== id) {
      return res.status(403).json({ error: 'You can only change your own password' });
    }

    const member = await prisma.staffMember.findUnique({ where: { id } });
    if (!member) return res.status(404).json({ error: 'Staff member not found' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.staffMember.update({ where: { id }, data: { password: hashed } });

    return res.json({ success: true });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ error: 'Failed to change password' });
  }
});

// DELETE /api/staff/members/:id (admin only)
router.delete('/members/:id', requireStaffAuth, requireAdmin, async (req: StaffRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (id === req.staffId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    const member = await prisma.staffMember.findUnique({ where: { id } });
    if (!member) return res.status(404).json({ error: 'Staff member not found' });
    if (member.isAdmin) return res.status(403).json({ error: 'Cannot delete admin accounts' });

    await prisma.staffMember.delete({ where: { id } });
    return res.json({ success: true });
  } catch (err) {
    console.error('Delete staff error:', err);
    return res.status(500).json({ error: 'Failed to delete staff member' });
  }
});

export default router;
