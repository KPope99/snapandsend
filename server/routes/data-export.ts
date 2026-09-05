import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { execFile } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET as string;

interface StaffRequest extends Request {
  isAdmin?: boolean;
}

function requireAdmin(req: StaffRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { isAdmin: boolean };
    if (!decoded.isAdmin) return res.status(403).json({ error: 'Admin access required' });
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

// GET /api/data-export — one-off admin export of the persistent data dir
// (SQLite DB + uploaded images) for the Azure -> GCP infra migration.
// Remove this route once the migration is complete.
router.get('/', requireAdmin, (_req: Request, res: Response) => {
  const tmpFile = path.join(os.tmpdir(), `snapandsend-export-${Date.now()}.tar.gz`);
  execFile('tar', ['czf', tmpFile, '-C', '/home', 'data', 'uploads'], (err) => {
    if (err) {
      console.error('Export error:', err);
      return res.status(500).json({ error: 'Export failed' });
    }
    res.download(tmpFile, 'snapandsend-export.tar.gz', (sendErr) => {
      if (sendErr) console.error('Export download error:', sendErr);
      fs.unlink(tmpFile, () => {});
    });
  });
});

export default router;
