import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { analyzeMediaForReport, verifyLocationMatch } from '../services/vision.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// In production use persistent Azure storage, otherwise local uploads folder
const uploadsDir = process.env.NODE_ENV === 'production'
  ? '/home/uploads'
  : path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'];

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit (covers videos up to ~10s)
  },
  fileFilter: (_req, file, cb) => {
    if ([...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: JPEG, PNG, GIF, WebP images and MP4, MOV, WebM videos.'));
    }
  }
});

// Upload single or multiple images/videos
router.post('/upload', upload.array('images', 5), (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const imageUrls = files.map(file => `/uploads/${file.filename}`);

    res.json({ imageUrls });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// Analyze an uploaded image or video with AI to suggest title, description, and category
router.post('/analyze', async (req: Request, res: Response) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: 'imageUrl is required' });
  }

  try {
    const port = process.env.SERVER_PORT || 5002;
    const absoluteUrl = imageUrl.startsWith('/')
      ? `http://localhost:${port}${imageUrl}`
      : imageUrl;

    const analysis = await analyzeMediaForReport(absoluteUrl);
    res.json(analysis);
  } catch (error) {
    console.error('Media analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze file' });
  }
});

// Verify that an uploaded image matches a specified location
router.post('/verify-location', async (req: Request, res: Response) => {
  const { imageUrl, location } = req.body;

  if (!imageUrl || !location) {
    return res.status(400).json({ error: 'imageUrl and location are required' });
  }

  try {
    const port = process.env.SERVER_PORT || 5002;
    const absoluteUrl = imageUrl.startsWith('/')
      ? `http://localhost:${port}${imageUrl}`
      : imageUrl;

    const result = await verifyLocationMatch(absoluteUrl, location);
    res.json(result);
  } catch (error) {
    console.error('Location verification error:', error);
    res.status(500).json({ error: 'Failed to verify location' });
  }
});

// Error handling middleware for multer
router.use((err: Error, _req: Request, res: Response, _next: Function) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Images max 10MB, videos max 50MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;
