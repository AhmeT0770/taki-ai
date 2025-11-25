import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
    // CORS configuration
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { imageBase64, prompt, config } = req.body;

        if (!imageBase64 || !prompt) {
            return res.status(400).json({ error: 'Image and prompt required' });
        }

        const apiKey = process.env.API_KEY;
        const imageModel = process.env.IMAGE_MODEL || 'gemini-3-pro-image-preview';

        if (!apiKey) {
            return res.status(500).json({ error: 'Server configuration error: API Key missing' });
        }

        const ai = new GoogleGenAI({ apiKey });

        const base64Match = imageBase64.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
        if (!base64Match) {
            return res.status(400).json({ error: 'Invalid image format' });
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
            throw new Error('No response from AI model');
        }

        const parts = response.candidates[0].content.parts;
        const imagePart = parts.find(p => p.inlineData?.mimeType?.startsWith('image/'));

        if (!imagePart) {
            throw new Error('No image generated');
        }

        const generatedImage = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        return res.status(200).json({ image: generatedImage });

    } catch (error) {
        console.error('Generate image error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
