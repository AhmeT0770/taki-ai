import { GoogleGenAI } from '@google/genai';

export default async (req, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json',
    };

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers,
        });
    }

    try {
        const { imageBase64 } = await req.json();

        if (!imageBase64) {
            return new Response(JSON.stringify({ error: 'imageBase64 required' }), {
                status: 400,
                headers,
            });
        }

        const API_KEY = Netlify.env.get('API_KEY');

        if (!API_KEY) {
            throw new Error('API_KEY not configured');
        }

        const ai = new GoogleGenAI({ apiKey: API_KEY });

        // Extract base64 data
        const base64Match = imageBase64.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
        if (!base64Match) {
            throw new Error('Invalid image format');
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
            model: 'gemini-2.0-flash-exp',
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

        return new Response(JSON.stringify(result), {
            status: 200,
            headers,
        });

    } catch (error) {
        console.error('Plan shoots error:', error);
        return new Response(JSON.stringify({
            error: error.message || 'Failed to plan shoots'
        }), {
            status: 500,
            headers,
        });
    }
};

export const config = {
    path: '/api/plan-shoots'
};
