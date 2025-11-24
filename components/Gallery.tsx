import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, Download, Loader2 } from 'lucide-react';
import { getSavedImages, deleteImage } from '../services/supabaseClient';
import { Button } from './Button';

interface SavedImage {
    id: string;
    created_at: string;
    name: string;
    image_url: string;
    style: string;
    prompt: string;
}

interface GalleryProps {
    onBack: () => void;
}

export const Gallery: React.FC<GalleryProps> = ({ onBack }) => {
    const [images, setImages] = useState<SavedImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        loadImages();
    }, []);

    const loadImages = async () => {
        try {
            setIsLoading(true);
            const data = await getSavedImages();
            setImages(data || []);
        } catch (error) {
            console.error('Görseller yüklenemedi:', error);
            alert('Görseller yüklenirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string, imageUrl: string) => {
        if (!confirm('Bu görseli silmek istediğinizden emin misiniz?')) return;

        try {
            setDeletingId(id);
            await deleteImage(id, imageUrl);
            setImages(images.filter(img => img.id !== id));
        } catch (error) {
            console.error('Silme hatası:', error);
            alert('Silme sırasında bir hata oluştu.');
        } finally {
            setDeletingId(null);
        }
    };

    const handleDownload = (imageUrl: string, name: string) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `${name}.png`;
        link.click();
    };

    return (
        <div className="min-h-screen bg-[#f7f7f7]">
            {/* Header */}
            <header className="bg-white border-b border-luxury-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-luxury-50 rounded-full transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-xl font-serif font-bold">Galeri</h1>
                    </div>
                    <div className="text-sm text-luxury-500">
                        {images.length} kayıtlı görsel
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-luxury-400 mb-4" size={48} />
                        <p className="text-luxury-500">Görseller yükleniyor...</p>
                    </div>
                ) : images.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="text-luxury-300 mb-4">
                            <svg className="w-24 h-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-serif font-bold text-luxury-700 mb-2">
                            Henüz kayıtlı görsel yok
                        </h3>
                        <p className="text-luxury-500 mb-6">
                            Ürettiğiniz görselleri kaydetmeye başlayın
                        </p>
                        <Button onClick={onBack}>Ana Sayfaya Dön</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {images.map((image) => (
                            <div
                                key={image.id}
                                className="bg-white rounded-sm border border-luxury-200 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                            >
                                <div className="relative aspect-square bg-luxury-50 overflow-hidden">
                                    <img
                                        src={image.image_url}
                                        alt={image.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />

                                    {/* Hover Actions */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                                        <button
                                            onClick={() => handleDownload(image.image_url, image.name)}
                                            className="bg-white text-black p-3 rounded-full hover:bg-luxury-50 transition-colors"
                                            title="İndir"
                                        >
                                            <Download size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(image.id, image.image_url)}
                                            disabled={deletingId === image.id}
                                            className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                                            title="Sil"
                                        >
                                            {deletingId === image.id ? (
                                                <Loader2 className="animate-spin" size={18} />
                                            ) : (
                                                <Trash2 size={18} />
                                            )}
                                        </button>
                                    </div>

                                    {/* Style Badge */}
                                    {image.style && (
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-bold tracking-widest uppercase text-luxury-900 shadow-sm border border-luxury-100">
                                                {image.style}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-5 bg-white">
                                    <h3 className="font-serif text-lg font-bold text-luxury-900 mb-2 line-clamp-2">
                                        {image.name}
                                    </h3>
                                    <p className="text-xs text-luxury-400">
                                        {new Date(image.created_at).toLocaleDateString('tr-TR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};
