import fs from 'fs';
import path from 'path';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export interface ImageAnalysisResult {
  category: string; // Can be a base category or AI-suggested new category
  categoryLabel: string; // Human-readable label for the category
  isNewCategory: boolean; // Whether this is a new AI-suggested category
  confidence: number;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  details: string[];
}

const BASE_CATEGORIES = ['pothole', 'garbage', 'vandalism', 'drainage', 'signage', 'robbery', 'other'];

const CATEGORY_DESCRIPTIONS = {
  pothole: 'Road damage, potholes, cracks, or deteriorating pavement',
  garbage: 'Illegal dumping, overflowing bins, litter, or waste accumulation',
  vandalism: 'Graffiti, property damage, broken windows, or defacement',
  drainage: 'Flooding, blocked drains, sewage issues, or water accumulation',
  signage: 'Damaged signs, missing signs, obscured signs, or traffic signal issues',
  robbery: 'Crime scene, break-in evidence, security concerns, or suspicious activity',
  other: 'Other infrastructure or community issues not fitting above categories'
};

export async function analyzeImage(imagePath: string): Promise<ImageAnalysisResult> {
  if (!OPENAI_API_KEY) {
    console.warn('OpenAI API key not configured, using fallback analysis');
    return getFallbackAnalysis();
  }

  try {
    // Read the image file and convert to base64
    const absolutePath = path.isAbsolute(imagePath)
      ? imagePath
      : path.join(process.cwd(), imagePath);

    const imageBuffer = fs.readFileSync(absolutePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = getMimeType(absolutePath);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that analyzes images of infrastructure issues and incidents for a community reporting app called SnapAndSend.

Your task is to analyze the image and categorize it. Use one of these existing categories if applicable:
${Object.entries(CATEGORY_DESCRIPTIONS).map(([key, desc]) => `- ${key}: ${desc}`).join('\n')}

IMPORTANT: If the image shows an incident that doesn't fit any of the above categories well, you SHOULD create a new category. Use a short, lowercase, single-word identifier (e.g., "fire", "flood", "accident", "pollution", "construction").

Respond with a JSON object containing:
- category: a category identifier (use existing ones above, OR create a new descriptive one)
- categoryLabel: human-readable label for the category (e.g., "Fire Hazard", "Flooding", "Traffic Accident")
- confidence: number between 0 and 1 indicating how confident you are
- title: a brief descriptive title (max 60 chars)
- description: a detailed description of what you see (2-3 sentences, max 200 chars)
- severity: one of [low, medium, high] based on urgency/danger
- details: array of specific observations (2-4 bullet points)

Be specific and helpful. Create new categories when the image clearly shows something distinct from the existing categories.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this image and identify what type of incident or issue it shows. Provide your analysis in JSON format.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                  detail: 'low'
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      return getFallbackAnalysis();
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return getFallbackAnalysis();
    }

    const analysis = JSON.parse(content) as ImageAnalysisResult;

    // Sanitize the category (lowercase, no spaces)
    const category = sanitizeCategory(analysis.category);
    const isNewCategory = !BASE_CATEGORIES.includes(category);

    // Validate and sanitize the response
    return {
      category,
      categoryLabel: analysis.categoryLabel || formatCategoryLabel(category),
      isNewCategory,
      confidence: Math.min(1, Math.max(0, analysis.confidence || 0.5)),
      title: (analysis.title || 'Incident Report').slice(0, 100),
      description: (analysis.description || 'An incident has been detected in this image.').slice(0, 500),
      severity: validateSeverity(analysis.severity),
      details: Array.isArray(analysis.details) ? analysis.details.slice(0, 5) : []
    };
  } catch (error) {
    console.error('Error analyzing image:', error);
    return getFallbackAnalysis();
  }
}

export async function analyzeMultipleImages(imagePaths: string[]): Promise<ImageAnalysisResult> {
  if (imagePaths.length === 0) {
    return getFallbackAnalysis();
  }

  // Analyze the first image (primary) for categorization
  const primaryAnalysis = await analyzeImage(imagePaths[0]);

  // If there are more images, we could aggregate details, but for now use primary
  return primaryAnalysis;
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };
  return mimeTypes[ext] || 'image/jpeg';
}

function sanitizeCategory(category: string): string {
  // Convert to lowercase, remove spaces and special chars
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 20) || 'other';
}

function formatCategoryLabel(category: string): string {
  // Convert category id to readable label
  return category
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

function validateSeverity(severity: string): ImageAnalysisResult['severity'] {
  const validSeverities = ['low', 'medium', 'high'];
  return validSeverities.includes(severity)
    ? severity as ImageAnalysisResult['severity']
    : 'medium';
}

function getFallbackAnalysis(): ImageAnalysisResult {
  return {
    category: 'other',
    categoryLabel: 'Other',
    isNewCategory: false,
    confidence: 0,
    title: '',
    description: '',
    severity: 'medium',
    details: []
  };
}
