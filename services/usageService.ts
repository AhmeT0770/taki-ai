// Ücretsiz Deneme Takip Servisi
// LocalStorage kullanarak ilk deneme hakkını takip eder

const STORAGE_KEY = 'taki_ai_free_trial_used';
const MAX_FREE_TRIALS = 1;

export interface UsageData {
    trialCount: number;
    lastUsed: string | null;
}

/**
 * LocalStorage'dan kullanım verisini okur
 */
const getUsageData = (): UsageData => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Kullanım verisi okunamadı:', error);
    }
    return { trialCount: 0, lastUsed: null };
};

/**
 * LocalStorage'a kullanım verisini yazar
 */
const setUsageData = (data: UsageData): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Kullanım verisi kaydedilemedi:', error);
    }
};

/**
 * Ücretsiz deneme hakkının kullanılıp kullanılmadığını kontrol eder
 * @returns true eğer deneme hakkı tükendiyse
 */
export const hasUsedFreeTrial = (): boolean => {
    const data = getUsageData();
    return data.trialCount >= MAX_FREE_TRIALS;
};

/**
 * Kalan ücretsiz deneme sayısını döndürür
 */
export const getRemainingTrials = (): number => {
    const data = getUsageData();
    return Math.max(0, MAX_FREE_TRIALS - data.trialCount);
};

/**
 * Ücretsiz denemeyi kullanıldı olarak işaretler
 */
export const markFreeTrialUsed = (): void => {
    const data = getUsageData();
    data.trialCount += 1;
    data.lastUsed = new Date().toISOString();
    setUsageData(data);
};

/**
 * Ücretsiz deneme hakkını sıfırlar (sadece development için)
 */
export const resetFreeTrial = (): void => {
    if (import.meta.env.DEV) {
        localStorage.removeItem(STORAGE_KEY);
        console.log('🔄 Ücretsiz deneme hakkı sıfırlandı');
    }
};

/**
 * Kullanıcının görsel üretebilip üretemeyeceğini kontrol eder
 * @param isAuthenticated - Kullanıcı giriş yapmış mı
 * @returns true eğer kullanıcı görsel üretebiliyorsa
 */
export const canGenerateImage = (isAuthenticated: boolean): boolean => {
    // Giriş yapmış kullanıcılar her zaman üretebilir
    if (isAuthenticated) return true;

    // Giriş yapmamış kullanıcılar sadece deneme hakkı varsa üretebilir
    return !hasUsedFreeTrial();
};
