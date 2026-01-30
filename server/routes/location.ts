import { Router, Request, Response } from 'express';

const router = Router();

// Reverse geocode lat/lng to address
// Uses free Nominatim API (OpenStreetMap)
router.get('/reverse', async (req: Request, res: Response) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'SnapAndSend/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding service unavailable');
    }

    const data = await response.json();

    res.json({
      address: data.display_name,
      details: data.address
    });
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    res.status(500).json({ error: 'Failed to reverse geocode location' });
  }
});

export default router;
