import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// Fail fast if JWT_SECRET is missing or still set to the insecure default.
const JWT_SECRET_CHECK = process.env.JWT_SECRET;
if (!JWT_SECRET_CHECK || JWT_SECRET_CHECK === 'snapandsend-secret-key') {
  console.error('FATAL: JWT_SECRET is not set or is using the insecure default. Set a strong secret.');
  process.exit(1);
}

import reportsRouter from './routes/reports.js';
import imagesRouter from './routes/images.js';
import authRouter from './routes/auth.js';
import locationRouter from './routes/location.js';
import externalRouter from './routes/external.js';
import analysisRouter from './routes/analysis.js';
import staffRouter from './routes/staff.js';
import pagesRouter from './routes/pages.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.SERVER_PORT || 5002;

app.use(cors());
app.use(express.json());

// Serve uploaded images from persistent storage in production
const uploadsPath = process.env.NODE_ENV === 'production'
  ? '/home/uploads'
  : path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// API routes
app.use('/api/reports', reportsRouter);
app.use('/api/images', imagesRouter);
app.use('/api/auth', authRouter);
app.use('/api/location', locationRouter);

// External API for integrations (police, authorities, etc.)
app.use('/api/external', externalRouter);

// AI analysis for admin portal
app.use('/api/analysis', analysisRouter);

// Staff auth and management
app.use('/api/staff', staffRouter);

// CMS page content
app.use('/api/pages', pagesRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  app.get('/{*splat}', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
