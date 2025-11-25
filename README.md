# 💎 Takı AI Stüdyosu

Telefonla çektiğiniz sıradan takı fotoğraflarını, yapay zeka gücüyle **profesyonel stüdyo çekimlerine** dönüştürün.

## ✨ Özellikler

- 🎨 **3 Farklı Stil**: Minimalist, Lüks ve Doğal konseptler
- 🤖 **AI Powered**: Google Gemini 3 Pro ile native 4K görsel üretimi
- 🖼️ **Galeri Sistemi**: Favori çekimlerinizi Supabase'de kaydedin
- 💬 **Geri Bildirim**: Test ekibi için şifre korumalı mesajlaşma
- ⚡ **Anında Sonuç**: Saniyeler içinde profesyonel sonuçlar
- 🔒 **Güvenli**: Vercel API Routes ile tam güvenlik
- 📱 **Responsive**: Mobil ve desktop uyumlu
- ✏️ **AI Düzenleme**: Görselleri prompt ile özelleştirin

## 🚀 Canlı Demo

**[Demo'yu Görüntüle](#)** _(Vercel deploy sonrası eklenecek)_

## 🛠️ Teknolojiler

- **Frontend**: React + TypeScript + Vite
- **AI**: Google Gemini 3 Pro Image Preview
- **Backend**: Vercel API Routes (Serverless)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS + Cormorant Garamond + Montserrat
- **Deployment**: Vercel

## 📦 Kurulum

### Ön Koşullar

- Node.js 18+
- Gemini API Key ([buradan alın](https://aistudio.google.com/apikey))
- Supabase hesabı ([kaydol](https://supabase.com))
- Vercel hesabı ([kaydol](https://vercel.com))

### Adımlar

1. **Repo'yu klonlayın**
   ```bash
   git clone https://github.com/AhmeT0770/taki-ai.git
   cd taki-ai
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```

3. **Environment variables**
   
   `.env.local` dosyası oluşturun:
   ```env
   VITE_API_KEY=your-gemini-api-key
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_IMAGE_MODEL=gemini-3-pro-image-preview
   ```

4. **Supabase setup**
   
   SQL Editor'da çalıştırın:
   ```sql
   -- Galeri tablosu
   CREATE TABLE saved_images (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     created_at TIMESTAMPTZ DEFAULT NOW(),
     name TEXT NOT NULL,
     image_url TEXT NOT NULL,
     style TEXT,
     prompt TEXT
   );
   
   ALTER TABLE saved_images ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "public_read" ON saved_images FOR SELECT USING (true);
   CREATE POLICY "public_insert" ON saved_images FOR INSERT WITH CHECK (true);
   CREATE POLICY "public_delete" ON saved_images FOR DELETE USING (true);
   
   -- Geri bildirim tablosu
   CREATE TABLE feedback_messages (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     created_at TIMESTAMPTZ DEFAULT NOW(),
     message TEXT NOT NULL,
     is_admin BOOLEAN DEFAULT FALSE,
     reply_to UUID REFERENCES feedback_messages(id)
   );
   
   ALTER TABLE feedback_messages ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "public_all" ON feedback_messages FOR ALL USING (true);
   ```
   
   Storage → New bucket → `generated-images` (Public)

5. **Local'de çalıştırın**
   ```bash
   npm run dev
   ```

## 🌐 Deploy (Vercel)

### 1. GitHub'a Push
```bash
git push origin main
```

### 2. Vercel'de Deploy
1. [Vercel](https://vercel.com) → **Add New Project**
2. **Import from Git** → Repo'nuzu seçin
3. Framework: **Vite** (otomatik algılanır)

### 3. Environment Variables
Project Settings → Environment variables:
```
API_KEY = your-gemini-api-key
VITE_SUPABASE_URL = your-supabase-url
VITE_SUPABASE_ANON_KEY = your-supabase-anon-key
IMAGE_MODEL = gemini-3-pro-image-preview
```

### 4. Deploy! 🎉

## 📖 Kullanım

1. **Görsel Yükle**: Takı fotoğrafınızı yükleyin
2. **Ayarlar**: Boyut (2K/4K/8K) ve kadraj (Kare/Reels) seçin
3. **Oluştur**: "Stüdyo Fotoğrafları Oluştur" butonuna basın
4. **Düzenle**: AI düzenleyici ile özelleştirin
5. **Kaydet**: Galeriye kaydedin veya indirin
6. **Geri Bildirim**: Test ekibi şifre ile mesaj gönderebilir

### Geri Bildirim Sayfası
- URL: `/feedback`
- Şifre: Test ekibinizle paylaşın
- Admin mesajlara "Cevapla" ile yanıt verebilir

## 🔐 Güvenlik

- ✅ API anahtarları **Vercel API Routes**'da (backend)
- ✅ Local dev: Direkt API çağrısı (hızlı)
- ✅ Production: Serverless functions (güvenli)
- ✅ `.env.local` Git'e push edilmiyor
- ✅ Supabase RLS politikaları aktif
- ✅ CORS koruması

## 🏗️ Proje Yapısı

```
├── api/                      # Vercel serverless functions
│   ├── plan-shoots.js       # Konsept planlama
│   └── generate-image.js    # Görsel üretimi
├── components/              # React bileşenleri
│   ├── Feedback.tsx        # Geri bildirim sayfası
│   ├── Gallery.tsx         # Galeri
│   ├── OutfitCard.tsx      # Görsel kartı
│   └── ...
├── services/               # Servisler
│   ├── geminiService.ts    # Hybrid AI servisi
│   └── supabaseClient.ts   # DB & Storage
└── App.tsx                 # Ana uygulama
```

## 🎨 Özelleştirme

### Fontlar
- **Serif**: Cormorant Garamond (Başlıklar)
- **Sans**: Montserrat (Metinler)

### Renkler
Tailwind config'de `luxury` paleti tanımlı.

### AI Modeli
`.env.local`'de `VITE_IMAGE_MODEL` ile değiştirilebilir.

## 📝 Lisans

MIT License - İstediğiniz gibi kullanabilirsiniz!

## 🤝 Katkıda Bulunma

Pull request'ler memnuniyetle karşılanır!

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing`)
3. Commit edin (`git commit -m 'feat: amazing feature'`)
4. Push edin (`git push origin feature/amazing`)
5. Pull Request açın

## 📧 İletişim

Sorularınız için [issue](https://github.com/AhmeT0770/taki-ai/issues) açabilirsiniz.

---

**Not**: Gemini 3 Pro modeline erişim için Google AI Studio'da izin gerekebilir.
