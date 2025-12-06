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

// ============================================
// Auth Functions
// ============================================

/**
 * Email ve şifre ile giriş yapar
 */
export const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error('Giriş hatası:', error);
        throw error;
    }

    return data;
};

/**
 * Email ve şifre ile yeni hesap oluşturur
 */
export const signUpWithEmail = async (email: string, password: string, name?: string) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name || ''
            }
        }
    });

    if (error) {
        console.error('Kayıt hatası:', error);
        throw error;
    }

    return data;
};

/**
 * Google OAuth ile giriş yapar
 */
export const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
        }
    });

    if (error) {
        console.error('Google giriş hatası:', error);
        throw error;
    }

    return data;
};

/**
 * Oturumu kapatır
 */
export const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error('Çıkış hatası:', error);
        throw error;
    }
};

/**
 * Mevcut kullanıcıyı getirir
 */
export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
        console.error('Kullanıcı bilgisi alınamadı:', error);
        return null;
    }

    return user;
};

/**
 * Mevcut oturumu getirir (daha hızlı, cache kullanır)
 */
export const getSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
        console.error('Oturum bilgisi alınamadı:', error);
        return null;
    }

    return session;
};

/**
 * Auth durumu değişikliklerini dinler
 */
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
};
