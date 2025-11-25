import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_API_KEY;
const imageModel = import.meta.env.VITE_IMAGE_MODEL ?? 'gemini-3-pro-image-preview';

if (!apiKey) {
  console.warn('Gemini API key eksik. Lütfen .env.local dosyasını kontrol edin.');
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export const planShoots = async (imageBase64: string) => {
  const base64Match = imageBase64.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
  if (!base64Match) {
    throw new Error('Geçersiz görsel formatı');
  }

  const mimeType = `image/${base64Match[1]}`;
  const cleanBase64 = base64Match[2];

  const prompt = `Bu takı parçasını analiz et. Profesyonel bir ürün fotoğrafçısı ve sanat direktörü gibi davranmanı istiyorum.

3 adet profesyonel stüdyo fotoğraf konsepti planla:
1. Minimalist - Sade, zarif, modern ortam
2. Luxury - Lüks, zengin, gösterişli ortam
3. Nature - Doğal, organik, huzurlu ortam

Her konsept için:
- style: Konsept adı
- description: Hangi ortamda, nasıl bir atmosfer
- elements: Hangi aksesuarlar, ışık tarzı (virgülle ayrılmış liste)

JSON formatında döndür.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { inlineData: { mimeType, data: cleanBase64 } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'object',
        properties: {
          concepts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                style: { type: 'string' },
                description: { type: 'string' },
                elements: { type: 'array', items: { type: 'string' } }
              },
              required: ['style', 'description', 'elements']
            }
          }
        },
        required: ['concepts']
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateOrEditImage = async (
  imageBase64: string,
  prompt: string,
  config?: {
    resolution?: string;
    aspectRatio?: string;
  }
): Promise<string> => {
  const base64Match = imageBase64.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
  if (!base64Match) {
    throw new Error('Geçersiz görsel formatı');
  }

  const mimeType = `image/${base64Match[1]}`;
  const cleanBase64 = base64Match[2];

  const response = await ai.models.generateContent({
    model: imageModel,
    contents: {
      parts: [
        { inlineData: { mimeType, data: cleanBase64 } },
        { text: prompt }
      ]
    },
    config: {
      imageConfig: {
        imageSize: config?.resolution || '2K',
        aspectRatio: config?.aspectRatio || '1:1'
      }
    }
  });

  if (!response?.candidates?.[0]?.content?.parts) {
    throw new Error('AI modelinden yanıt alınamadı');
  }

  const parts = response.candidates[0].content.parts;
  const imagePart = parts.find(p => p.inlineData?.mimeType?.startsWith('image/'));

  if (!imagePart) {
    throw new Error('Görsel oluşturulamadı');
  }

  return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
};
