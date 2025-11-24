# 💎 Takı AI Stüdyosu

Telefonla çektiğiniz sıradan takı fotoğraflarını, yapay zeka gücüyle **profesyonel stüdyo çekimlerine** dönüştürün.

## ✨ Özellikler

- 🎨 **3 Farklı Stil**: Minimalist, Lüks ve Doğal konseptler
- 🤖 **AI Powered**: Google Gemini 2.0 ile görsel üretimi
- 🖼️ **Galeri Sistemi**: Favori çekimlerinizi kaydedin
- ⚡ **Anında Sonuç**: Saniyeler içinde profesyonel sonuçlar
- 🔒 **Güvenli**: Serverless functions ile API güvenliği
- 📱 **Responsive**: Mobil ve desktop uyumlu

## 🚀 Canlı Demo

**[Demo'yu Görüntüle](#)** _(Netlify deploy sonrası eklenecek)_

## 🛠️ Teknolojiler

- **Frontend**: React + TypeScript + Vite
- **AI**: Google Gemini 2.0 Flash
- **Backend**: Netlify Serverless Functions
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS + Custom Design System

## 📦 Kurulum

### Ön Koşullar

- Node.js 18+
- Gemini API Key ([buradan alın](https://aistudio.google.com/apikey))
- Supabase hesabı ([kaydol](https://supabase.com))

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
   API_KEY=your-gemini-api-key
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Supabase setup**
   
   SQL Editor'da çalıştırın:
   ```sql
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
   ```
   
   Storage → New bucket → `generated-images` (Public)

5. **Uygulamayı başlatın**
   ```bash
   npm run dev
   ```

## 🌐 Deploy (Netlify)

### 1. GitHub'a Push
```bash
git push origin main
```

### 2. Netlify'da Deploy
1. [Netlify](https://app.netlify.com) → **Add new site**
2. **Import from Git** → Repo'nuzu seçin
3. Build settings (otomatik gelecek):
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions: `netlify/functions`

### 3. Environment Variables
Site settings → Environment variables:
```
API_KEY = your-gemini-api-key
VITE_SUPABASE_URL = your-supabase-url
VITE_SUPABASE_ANON_KEY = your-supabase-anon-key
```

### 4. Deploy! 🎉

## 📖 Kullanım

1. **Görsel Yükle**: Takı fotoğrafınızı yükleyin
2. **Konsept Seç**: Boyut ve kadraj ayarlarını yapın
3. **Oluştur**: "Stüdyo Fotoğrafları Oluştur" butonuna basın
4. **Düzenle**: İsterseniz AI ile daha da iyileştirin
5. **Kaydet**: Galeriye kaydedin veya indirin

## 🔐 Güvenlik

- ✅ API anahtarları **serverless functions**'da (backend)
- ✅ `.env.local` Git'e push edilmiyor
- ✅ Supabase RLS politikaları aktif
- ✅ CORS koruması

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

**Made with ❤️ using Google Gemini 2.0**
