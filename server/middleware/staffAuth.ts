import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'snapandsend-secret-key';

export interface StaffRequest extends Request {
  staffId?: string;
  staffName?: string;
  isAdmin?: boolean;
}

export function requireStaffAuth(req: StaffRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { staffId: string; isAdmin: boolean; name?: string };
    req.staffId = decoded.staffId;
    req.isAdmin = decoded.isAdmin;
    req.staffName = decoded.name;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

export function requireAdmin(req: StaffRequest, res: Response, next: NextFunction) {
  if (!req.isAdmin) return res.status(403).json({ error: 'Admin access required' });
  next();
}
