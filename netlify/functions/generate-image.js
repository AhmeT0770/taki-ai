import { GoogleGenAI } from '@google/genai';

const buildEnhancedPrompt = async (aiClient, enhancement) => {
    const { userPrompt, resolutionText, aspectRatioText } = enhancement;
    const trimmedPrompt = (userPrompt || '').trim();
    if (!trimmedPrompt) {
        return null;
    }

    const instruction = `Bir kullanıcı mücevher ürün fotoğrafını düzenlemek için aşağıdaki talimatı verdi:
"""${trimmedPrompt}"""

Bu isteği profesyonel bir ürün fotoğrafçısı gibi tek cümlede yeniden yaz.
- Takı, ışık, arka plan ve atmosfer detaylarını geliştir.
- Kullanıcının niyetinden sapma ve gereksiz tekrar ekleme.
- Türkçe veya İngilizce dönebilirsin, ancak söylemi net ve ticari yap.
- Çıktının sonuna teknik gereksinim ekleme. Teknik bilgiler ayrıca eklenecek.

Sadece yeniden yazılmış cümleyi döndür.`;

    const response = await aiClient.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: [{ parts: [{ text: instruction }] }]
    });

    const enhanced = response?.text?.trim();
    if (!enhanced) {
        return null;
    }

    return `${enhanced}
Hedef fotoğraf boyutu: ${resolutionText}.
Kadraj: ${aspectRatioText}.
Gereksinimler: yüksek detay, makro lens, alan derinliği, ticari ışıklandırma, fotogerçekçi görünüm.`;
};

export default async (req, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers,
        });
    }

    try {
        const { imageBase64, prompt, enhancement } = await req.json();

        if (!imageBase64 || (!prompt && !enhancement?.userPrompt)) {
            return new Response(JSON.stringify({ error: 'imageBase64 and prompt required' }), {
                status: 400,
                headers,
            });
        }

        const API_KEY = Netlify.env.get('API_KEY');

        if (!API_KEY) {
            throw new Error('API_KEY not configured');
        }

        const ai = new GoogleGenAI({ apiKey: API_KEY });

        const base64Match = imageBase64.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
        if (!base64Match) {
            throw new Error('Invalid image format');
        }

        const mimeType = `image/${base64Match[1]}`;
        const cleanBase64 = base64Match[2];

        let finalPrompt = prompt;
        if (enhancement?.userPrompt) {
            const generatedPrompt = await buildEnhancedPrompt(ai, enhancement);
            if (generatedPrompt) {
                finalPrompt = generatedPrompt;
            } else if (!finalPrompt) {
                finalPrompt = enhancement.userPrompt;
            }
        }

        if (!finalPrompt) {
            throw new Error('Prompt missing');
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: {
                parts: [
                    { inlineData: { mimeType, data: cleanBase64 } },
                    { text: finalPrompt }
                ]
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

        const generatedBase64 = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;

        return new Response(JSON.stringify({ image: generatedBase64 }), {
            status: 200,
            headers,
        });

    } catch (error) {
        console.error('Generate image error:', error);
        return new Response(JSON.stringify({
            error: error.message || 'Failed to generate image'
        }), {
            status: 500,
            headers,
        });
    }
};

export const config = {
    path: '/api/generate-image'
};
