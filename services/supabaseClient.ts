import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL veya Anon Key eksik. Lütfen .env.local dosyasını kontrol edin.');
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);

export const uploadImageToStorage = async (imageBase64: string, fileName: string): Promise<string | null> => {
    try {
        const base64Response = await fetch(imageBase64);
        const blob = await base64Response.blob();

        const { data, error } = await supabase.storage
            .from('generated-images')
            .upload(fileName, blob, {
                contentType: 'image/png',
                upsert: true
            });

        if (error) {
            console.error('Görsel yükleme hatası:', error);
            throw error;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('generated-images')
            .getPublicUrl(fileName);

        return publicUrl;
    } catch (error) {
        console.error('Storage işlemi başarısız:', error);
        throw error;
    }
};

export const saveImageRecord = async (name: string, imageUrl: string, style: string, prompt: string) => {
    const { data, error } = await supabase
        .from('saved_images')
        .insert([
            {
                name,
                image_url: imageUrl,
                style,
                prompt
            }
        ])
        .select();

    if (error) {
        console.error('Veritabanı kayıt hatası:', error);
        throw error;
    }

    return data;
};

export const getSavedImages = async () => {
    const { data, error } = await supabase
        .from('saved_images')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Görseller yüklenemedi:', error);
        throw error;
    }

    return data;
};

export const deleteImage = async (id: string, imageUrl: string) => {
    // Extract filename from URL
    const fileName = imageUrl.split('/').pop();

    if (fileName) {
        await supabase.storage
            .from('generated-images')
            .remove([fileName]);
    }

    const { error } = await supabase
        .from('saved_images')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Silme hatası:', error);
        throw error;
    }
};

// Feedback Functions
export const getFeedbackMessages = async () => {
    const { data, error } = await supabase
        .from('feedback_messages')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Mesajlar yüklenemedi:', error);
        throw error;
    }

    return data;
};

export const addFeedbackMessage = async (message: string, isAdmin: boolean = false, replyTo?: string) => {
    const { data, error } = await supabase
        .from('feedback_messages')
        .insert([
            {
                message,
                is_admin: isAdmin,
                reply_to: replyTo || null
            }
        ])
        .select();

    if (error) {
        console.error('Mesaj gönderilemedi:', error);
        throw error;
    }

    return data;
};
