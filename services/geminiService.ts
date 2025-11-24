// Frontend service - calls Netlify Functions instead of direct API calls

const API_BASE = import.meta.env.DEV
  ? 'http://localhost:8888/api'  // Netlify Dev local
  : '/api';                       // Production

export const planShoots = async (imageBase64: string) => {
  const response = await fetch(`${API_BASE}/plan-shoots`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageBase64 }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to plan shoots');
  }

  return await response.json();
};

interface PromptEnhancementPayload {
  userPrompt: string;
  resolutionText: string;
  aspectRatioText: string;
}

interface GenerateImageOptions {
  enhancement?: PromptEnhancementPayload;
}

export const generateOrEditImage = async (
  imageBase64: string,
  prompt: string,
  options?: GenerateImageOptions
): Promise<string> => {
  const response = await fetch(`${API_BASE}/generate-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageBase64, prompt, enhancement: options?.enhancement }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate image');
  }

  const data = await response.json();
  return data.image;
};
