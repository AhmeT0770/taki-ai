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
        const { imageBase64 } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ error: 'Image data required' });
        }

        const apiKey = process.env.API_KEY;
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

        const result = JSON.parse(response.text);
        return res.status(200).json(result);

    } catch (error) {
        console.error('Plan shoots error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
