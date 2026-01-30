import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

import reportsRouter from './routes/reports.js';
import imagesRouter from './routes/images.js';
import authRouter from './routes/auth.js';
import locationRouter from './routes/location.js';
import externalRouter from './routes/external.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.SERVER_PORT || 5002;

app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api/reports', reportsRouter);
app.use('/api/images', imagesRouter);
app.use('/api/auth', authRouter);
app.use('/api/location', locationRouter);

// External API for integrations (police, authorities, etc.)
app.use('/api/external', externalRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
