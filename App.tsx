import React, { useState, useRef } from 'react';
import { Camera, Sparkles, AlertCircle, Aperture } from 'lucide-react';
import { PhotoConcept, PhotoStyle, GenerationStatus } from './types';
import { planShoots, generateOrEditImage } from './services/geminiService';
import { PhotoCard } from './components/OutfitCard'; // Using the component we updated
import { ImageEditorModal } from './components/ImageEditorModal';
import { Button } from './components/Button';
import { LoadingSpinner } from './components/LoadingSpinner';
import { SaveImageModal } from './components/SaveImageModal';
import { Gallery } from './components/Gallery';
import { uploadImageToStorage, saveImageRecord } from './services/supabaseClient';


type ResolutionOptionId = '2k' | '4k' | '8k';

interface ResolutionOption {
  id: ResolutionOptionId;
  label: string;
  description: string;
  promptText: string;
  width: number;
}

const RESOLUTION_OPTIONS: ResolutionOption[] = [
  {
    id: '2k',
    label: '2K',
    description: 'Yaklaşık 2048 px genişlik • hızlı önizleme',
    promptText: 'yaklaşık 2048 piksel genişlikte (2K)',
    width: 2048
  },
  {
    id: '4k',
    label: '4K',
    description: 'Yaklaşık 4096 px genişlik • dengeli kalite',
    promptText: 'yaklaşık 4096 piksel genişlikte (4K)',
    width: 4096
  },
  {
    id: '8k',
    label: '8K',
    description: 'Yaklaşık 8192 px genişlik • en yüksek detay',
    promptText: 'yaklaşık 8192 piksel genişlikte (8K)',
    width: 8192
  }
];

type AspectRatioOptionId = 'square' | 'reels';

interface AspectRatioOption {
  id: AspectRatioOptionId;
  label: string;
  description: string;
  promptText: string;
  ratio: number; // width / height
  badge?: string;
}

const ASPECT_RATIO_OPTIONS: AspectRatioOption[] = [
  {
    id: 'square',
    label: 'Kare',
    description: '1:1 • katalog ve grid gönderileri için ideal',
    promptText: 'kare (1:1) kadraj',
    ratio: 1,
    badge: '1:1'
  },
  {
    id: 'reels',
    label: 'Reels / Dikey',
    description: '9:16 • Reels, Story ve Shorts için tam ekran',
    promptText: 'dikey 9:16 (reels) kadraj',
    ratio: 9 / 16,
    badge: '9:16'
  }
];

const getResolutionDetails = (resolutionId: ResolutionOptionId): ResolutionOption => {
  return RESOLUTION_OPTIONS.find(option => option.id === resolutionId) ?? RESOLUTION_OPTIONS[RESOLUTION_OPTIONS.length - 1];
};

const getAspectRatioDetails = (aspectRatioId: AspectRatioOptionId): AspectRatioOption => {
  return ASPECT_RATIO_OPTIONS.find(option => option.id === aspectRatioId) ?? ASPECT_RATIO_OPTIONS[0];
};

const resizeBase64Image = (imageBase64: string, targetWidth: number): Promise<string> => {
  if (typeof window === 'undefined') {
    return Promise.resolve(imageBase64);
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        if (!img.width || !img.height || !Number.isFinite(targetWidth) || targetWidth <= 0) {
          resolve(imageBase64);
          return;
        }

        if (Math.abs(img.width - targetWidth) < 10) {
          resolve(imageBase64);
          return;
        }

        const scale = targetWidth / img.width;
        const targetHeight = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(targetWidth);
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(imageBase64);
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(imageBase64);
      img.src = imageBase64;
    } catch {
      resolve(imageBase64);
    }
  });
};

const ensureImageResolution = async (imageBase64: string, resolutionId: ResolutionOptionId): Promise<string> => {
  const details = getResolutionDetails(resolutionId);
  if (!details.width) return imageBase64;
  return resizeBase64Image(imageBase64, details.width);
};

const ensureAspectRatio = async (imageBase64: string, aspectRatioId: AspectRatioOptionId): Promise<string> => {
  if (typeof window === 'undefined') {
    return imageBase64;
  }

  return new Promise((resolve) => {
    try {
      const details = getAspectRatioDetails(aspectRatioId);
      if (!details.ratio || !Number.isFinite(details.ratio) || details.ratio <= 0) {
        resolve(imageBase64);
        return;
      }

      const img = new Image();
      img.onload = () => {
        if (!img.width || !img.height) {
          resolve(imageBase64);
          return;
        }

        const targetWidth = img.width;
        const targetHeight = Math.max(1, Math.round(targetWidth / details.ratio));

        if (Math.abs(img.height - targetHeight) < 10) {
          resolve(imageBase64);
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(imageBase64);
          return;
        }

        const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const dx = (targetWidth - scaledWidth) / 2;
        const dy = (targetHeight - scaledHeight) / 2;
        ctx.drawImage(img, dx, dy, scaledWidth, scaledHeight);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(imageBase64);
      img.src = imageBase64;
    } catch {
      resolve(imageBase64);
    }
  });
};

const App: React.FC = () => {
  // State
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [concepts, setConcepts] = useState<PhotoConcept[]>([]);
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [selectedResolution, setSelectedResolution] = useState<ResolutionOptionId>('8k');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatioOptionId>('square');
  const [currentPage, setCurrentPage] = useState<'home' | 'gallery'>('home');

  // Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [conceptToSave, setConceptToSave] = useState<PhotoConcept | null>(null);
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  const activeResolution = getResolutionDetails(selectedResolution);
  const activeAspectRatio = getAspectRatioDetails(selectedAspectRatio);
  const isGenerating = status === 'analyzing' || status === 'generating';

  // References
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError("Dosya boyutu çok büyük. Lütfen 5 MB altındaki bir görsel yükleyin.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setSourceImage(base64);
      // Reset state
      setConcepts([]);
      setStatus('idle');
      setError(null);
    };
    reader.onerror = () => setError("Dosya okunamadı.");
    reader.readAsDataURL(file);
  };

  const startGeneration = async () => {
    if (!sourceImage) return;

    setStatus('analyzing');
    setError(null);

    try {
      // 1. Plan the shoots using Text Model
      const plan = await planShoots(sourceImage);

      // Initialize concepts state with text data
      const initialConcepts: PhotoConcept[] = plan.concepts.map((s, index) => ({
        id: `concept-${index}-${Date.now()}`,
        style: s.style as PhotoStyle,
        description: s.description,
        elements: s.elements,
        generatedImageBase64: undefined,
        isLoadingImage: true
      }));

      setConcepts(initialConcepts);
      setStatus('generating');

      // 2. Generate images for each concept in parallel
      const generationResolution = selectedResolution;
      const generationAspectRatio = selectedAspectRatio;
      initialConcepts.forEach(concept => {
        generateSingleImage(concept, sourceImage, generationResolution, generationAspectRatio);
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Fotoğraflar oluşturulamadı. Lütfen tekrar deneyin.");
      setStatus('error');
    }
  };

  const generateSingleImage = async (
    concept: PhotoConcept,
    baseImage: string,
    resolutionId: ResolutionOptionId,
    aspectRatioId: AspectRatioOptionId
  ) => {
    try {
      const resolutionDetails = getResolutionDetails(resolutionId);
      const aspectRatioDetails = getAspectRatioDetails(aspectRatioId);
      // Construct a prompt that acts as a photography brief
      const prompt = `Referans görseldeki takı ürününe ait profesyonel ürün fotoğrafı.
      Stil: ${concept.style}.
      Ortam/Bağlam: ${concept.description}.
      Aksesuarlar ve Işık: ${concept.elements.join(', ')}.
      Hedef fotoğraf boyutu: ${resolutionDetails.promptText}.
      Kadraj: ${aspectRatioDetails.promptText}.
      Gereksinimler: yüksek detay, makro lens, alan derinliği, ticari ışıklandırma, fotogerçekçi görünüm.
      Takı ürününü aynen koru, sadece bu yeni ortamda sergile.`;

      const generatedImage = await generateOrEditImage(baseImage, prompt);
      const normalizedImage = await ensureImageResolution(generatedImage, resolutionId);
      const finalImage = await ensureAspectRatio(normalizedImage, aspectRatioId);

      setConcepts(prev => prev.map(c =>
        c.id === concept.id
          ? { ...c, generatedImageBase64: finalImage, isLoadingImage: false }
          : c
      ));
    } catch (err) {
      console.error(`${concept.style} için görsel oluşturulamadı`, err);
      // Stop loading indicator even if failed
      setConcepts(prev => prev.map(c =>
        c.id === concept.id
          ? { ...c, isLoadingImage: false }
          : c
      ));
    }
  };

  const handleEditClick = (concept: PhotoConcept) => {
    setSelectedConceptId(concept.id);
    setIsEditorOpen(true);
  };

  const handleRegenerateClick = (concept: PhotoConcept) => {
    if (!sourceImage) return;
    setConcepts(prev => prev.map(c =>
      c.id === concept.id
        ? { ...c, isLoadingImage: true }
        : c
    ));
    const resolutionForRun = selectedResolution;
    const aspectRatioForRun = selectedAspectRatio;
    generateSingleImage(concept, sourceImage, resolutionForRun, aspectRatioForRun);
  };

  const handleConfirmEdit = async (conceptId: string, prompt: string) => {
    const concept = concepts.find(c => c.id === conceptId);
    if (!concept || !concept.generatedImageBase64) return;

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;

    try {
      const resolutionForEdit = selectedResolution;
      const aspectRatioForEdit = selectedAspectRatio;
      const resolutionDetails = getResolutionDetails(resolutionForEdit);
      const aspectRatioDetails = getAspectRatioDetails(aspectRatioForEdit);

      const enhancementPayload = {
        userPrompt: trimmedPrompt,
        resolutionText: resolutionDetails.promptText,
        aspectRatioText: aspectRatioDetails.promptText
      };

      const newImage = await generateOrEditImage(
        concept.generatedImageBase64,
        trimmedPrompt,
        { enhancement: enhancementPayload }
      );
      const normalizedImage = await ensureImageResolution(newImage, resolutionForEdit);
      const finalImage = await ensureAspectRatio(normalizedImage, aspectRatioForEdit);
      setConcepts(prev => prev.map(c =>
        c.id === conceptId
          ? { ...c, generatedImageBase64: finalImage }
          : c
      ));
    } catch (err) {
      console.error("Düzenleme başarısız oldu", err);
      throw err;
    }
  };

  const handleSaveClick = (concept: PhotoConcept) => {
    setConceptToSave(concept);
    setIsSaveModalOpen(true);
  };

  const handleSaveConfirm = async (name: string) => {
    if (!conceptToSave || !conceptToSave.generatedImageBase64) return;

    try {
      const fileName = `${Date.now()}-${name.replace(/\s+/g, '-').toLowerCase()}.png`;
      const publicUrl = await uploadImageToStorage(conceptToSave.generatedImageBase64, fileName);

      if (publicUrl) {
        await saveImageRecord(
          name,
          publicUrl,
          conceptToSave.style,
          conceptToSave.description
        );
        alert(`"${name}" galeriye kaydedildi! ✅`);
        setIsSaveModalOpen(false);
      } else {
        throw new Error('Görsel yüklenemedi');
      }
    } catch (error) {
      console.error('Kaydetme işlemi başarısız:', error);
      throw error;
    }
  };

  const activeConcept = concepts.find(c => c.id === selectedConceptId) || null;
  const allImagesLoaded = concepts.length > 0 && concepts.every(c => !c.isLoadingImage);

  // Show Gallery if on gallery page
  if (currentPage === 'gallery') {
    return <Gallery onBack={() => setCurrentPage('home')} />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-luxury-900 bg-[#f7f7f7]">

      {/* Header */}
      <header className="bg-white border-b border-luxury-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-luxury-900 text-white p-2 rounded-sm">
              <Aperture size={20} />
            </span>
            <h1 className="text-xl font-serif font-bold tracking-tight">Web Stüdyonuz</h1>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentPage('gallery')}
              className="text-sm font-medium text-luxury-700 hover:text-luxury-900 transition-colors"
            >
              Galeri
            </button>
            <div className="text-xs font-medium text-luxury-500 uppercase tracking-widest hidden sm:block">
              Profesyonel Ürün Fotoğrafllığı
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-grow flex flex-col">

          {/* Section 1: Upload */}
          <section className={`transition-all duration-500 ${concepts.length > 0 ? 'mb-12' : 'flex-grow flex flex-col justify-center items-center'}`}>

            {concepts.length === 0 && (
              <div className="text-center mb-10 max-w-2xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-luxury-900">
                  Anlık çekimleri stüdyo karelerine dönüştürün.
                </h2>
                <p className="text-lg text-luxury-500 mb-8 leading-relaxed font-light">
                  Takınızın basit bir fotoğrafını yükleyin. Yapay zekâmız onu kusursuz ışıkta profesyonel stüdyo sahnelerine taşır.
                </p>
              </div>
            )}

            <div className={`w-full ${concepts.length > 0 ? 'flex flex-row gap-6 items-center bg-white p-4 border border-luxury-200 shadow-sm rounded-sm' : 'max-w-xl mx-auto'}`}>

              {/* Visual indicator of source image */}
              {sourceImage && concepts.length > 0 && (
                <div className="flex-shrink-0 relative w-20 h-20 bg-luxury-100 border border-luxury-200 overflow-hidden rounded-sm">
                  <img src={sourceImage} alt="Kaynak" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/5"></div>
                </div>
              )}

              <div className={`flex-grow ${concepts.length === 0 ? 'bg-white p-8 border border-dashed border-luxury-300 hover:border-luxury-800 transition-colors cursor-pointer text-center' : ''}`}
                onClick={concepts.length === 0 ? () => fileInputRef.current?.click() : undefined}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileSelect}
                />

                {concepts.length === 0 ? (
                  <div className="flex flex-col items-center">
                    {sourceImage ? (
                      <div className="relative w-64 h-64 mb-6 bg-luxury-50 overflow-hidden shadow-sm border border-luxury-100 p-2">
                        <img src={sourceImage} alt="Önizleme" className="w-full h-full object-contain" />
                        <button
                          onClick={(e) => { e.stopPropagation(); setSourceImage(null); }}
                          className="absolute top-4 right-4 bg-white/90 p-1.5 rounded-full text-luxury-900 hover:bg-white shadow-sm"
                        >
                          <AlertCircle size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 border border-luxury-200 rounded-full flex items-center justify-center mb-4 text-luxury-400">
                        <Camera size={24} />
                      </div>
                    )}

                    {!sourceImage && (
                      <>
                        <p className="font-medium text-lg mb-2 text-luxury-800">Fotoğraf yüklemek için tıklayın</p>
                        <p className="text-sm text-luxury-400">Desteklenen formatlar: JPG, PNG</p>
                      </>
                    )}

                    {sourceImage && (
                      <Button
                        onClick={(e) => { e.stopPropagation(); startGeneration(); }}
                        isLoading={isGenerating}
                        className="w-full mt-4"
                      >
                        Stüdyo Fotoğrafları Oluştur
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-between items-center w-full">
                    <div>
                      <h3 className="font-serif text-lg font-bold">Orijinal Görsel</h3>
                      <p className="text-xs text-luxury-500">YZ üretimi için temel</p>
                    </div>
                    <Button variant="outline" onClick={() => {
                      setConcepts([]);
                      setSourceImage(null);
                    }} className="py-2 text-xs">
                      Yeni Yükle
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {concepts.length === 0 && (
              <div className="mt-8 w-full max-w-xl mx-auto">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-luxury-400">Fotoğraf Boyutu</h4>
                    <p className="text-xs text-luxury-500">Oluşturulan görsellerin uzun kenarı bu değere göre ayarlanır.</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-luxury-500">
                    <Sparkles size={14} />
                    <span>{activeResolution.label} • ~{activeResolution.width}px</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {RESOLUTION_OPTIONS.map(option => {
                    const isActive = option.id === selectedResolution;
                    return (
                      <button
                        type="button"
                        key={option.id}
                        onClick={() => setSelectedResolution(option.id)}
                        disabled={isGenerating}
                        className={`border p-4 text-left rounded-sm transition-colors ${isActive ? 'border-luxury-900 bg-white shadow-sm' : 'border-dashed border-luxury-200 hover:border-luxury-400'}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-base font-semibold text-luxury-900">{option.label}</span>
                          {isActive && (
                            <span className="text-[10px] font-bold uppercase tracking-widest text-luxury-500">Seçili</span>
                          )}
                        </div>
                        <p className="text-xs text-luxury-500 mt-1">{option.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {concepts.length === 0 && (
              <div className="mt-6 w-full max-w-xl mx-auto">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-luxury-400">Kadraj</h4>
                    <p className="text-xs text-luxury-500">Kare veya Reels boyutunu seçerek platforma uygun kompozisyon alın.</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-luxury-500">
                    <Aperture size={14} />
                    <span>{activeAspectRatio.label}{activeAspectRatio.badge ? ` • ${activeAspectRatio.badge}` : ''}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ASPECT_RATIO_OPTIONS.map(option => {
                    const isActive = option.id === selectedAspectRatio;
                    return (
                      <button
                        type="button"
                        key={option.id}
                        onClick={() => setSelectedAspectRatio(option.id)}
                        disabled={isGenerating}
                        className={`border p-4 text-left rounded-sm transition-colors ${isActive ? 'border-luxury-900 bg-white shadow-sm' : 'border-dashed border-luxury-200 hover:border-luxury-400'}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-base font-semibold text-luxury-900">{option.label}</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-luxury-500">{option.badge}</span>
                        </div>
                        <p className="text-xs text-luxury-500 mt-1">{option.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-800 border border-red-200 rounded-sm flex items-center gap-2 max-w-xl mx-auto text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
          </section>

          {/* Section 2: Results Grid */}
          {concepts.length > 0 && (
            <section className="flex-grow animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-serif font-bold text-luxury-900">Stüdyo Sonuçları</h2>
                {status === 'generating' && !allImagesLoaded && (
                  <div className="flex items-center gap-2 text-sm text-luxury-500">
                    <LoadingSpinner size="sm" />
                    <span>Stüdyoda işleniyor...</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {concepts.map((concept) => (
                  <div key={concept.id} className="h-full">
                    <PhotoCard
                      concept={concept}
                      onEdit={handleEditClick}
                      onRegenerate={handleRegenerateClick}
                      onSave={handleSaveClick}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-luxury-200 py-8 text-center text-xs text-luxury-400 uppercase tracking-widest">
        <p>Prototip &bull; Web Fotoğraf</p>
      </footer>

      {/* Editor Modal */}
      <ImageEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        concept={activeConcept}
        onConfirmEdit={handleConfirmEdit}
      />

      <SaveImageModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveConfirm}
        imageUrl={conceptToSave?.generatedImageBase64}
      />



    </div>
  );
};

export default App;
