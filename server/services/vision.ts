import dotenv from 'dotenv';
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const BASE_CATEGORY_VALUES = ['pothole', 'garbage', 'vandalism', 'drainage', 'signage', 'robbery', 'other'];

export interface ImageAnalysis {
  title: string;
  description: string;
  category: string;
  categoryLabel: string;
  isNewCategory: boolean;
}

export async function analyzeImageForReport(imageUrl: string): Promise<ImageAnalysis> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const imgResponse = await fetch(imageUrl);
  if (!imgResponse.ok) {
    throw new Error(`Failed to fetch image: ${imgResponse.statusText}`);
  }
  const buffer = await imgResponse.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const mimeType = imgResponse.headers.get('content-type') || 'image/jpeg';

  const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant for a community incident reporting app. Analyze the image and identify the main issue or incident visible.

Return JSON with exactly these fields:
- title: Short descriptive title (5-10 words) of the incident/issue visible
- description: 2-3 sentence factual description of what you observe, suitable for a community report
- category: Best matching category from this list: pothole, garbage, vandalism, drainage, signage, robbery, other. If none fit well, use a new lowercase single-word or hyphenated category (e.g. "fire", "flooding", "road-accident", "assault")
- categoryLabel: Human-readable label for the category (e.g. "Pothole", "Fire", "Flooding", "Road Accident")
- isNewCategory: true if your category is not in [pothole, garbage, vandalism, drainage, signage, robbery, other], false otherwise

Be concise and factual.`,
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this image for a community incident report.' },
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64}`, detail: 'low' },
            },
          ],
        },
      ],
      max_tokens: 300,
      response_format: { type: 'json_object' },
    }),
  });

  if (!aiResponse.ok) {
    const err = await aiResponse.text();
    console.error('OpenAI error:', err);
    throw new Error('AI analysis failed');
  }

  const data = await aiResponse.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('No analysis content returned');

  const parsed = JSON.parse(content);

  const category = (parsed.category || 'other').toLowerCase().trim();

  return {
    title: parsed.title || '',
    description: parsed.description || '',
    category,
    categoryLabel: parsed.categoryLabel || category.charAt(0).toUpperCase() + category.slice(1),
    isNewCategory: parsed.isNewCategory === true && !BASE_CATEGORY_VALUES.includes(category),
  };
}
