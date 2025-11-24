import React from 'react';
import { PhotoConcept } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { Edit2, RefreshCw, Download, Save } from 'lucide-react';

interface PhotoCardProps {
  concept: PhotoConcept;
  onEdit: (concept: PhotoConcept) => void;
  onRegenerate: (concept: PhotoConcept) => void;
  onSave: (concept: PhotoConcept) => void;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ concept, onEdit, onRegenerate, onSave }) => {

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (concept.generatedImageBase64) {
      const link = document.createElement('a');
      link.href = concept.generatedImageBase64;
      link.download = `taki-${concept.style.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.click();
    }
  };

  return (
    <div className="group relative bg-white border border-luxury-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full rounded-sm overflow-hidden">
      <div className="relative aspect-square bg-luxury-50 overflow-hidden w-full">
        {concept.isLoadingImage ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-luxury-400">
            <LoadingSpinner size="lg" color="border-luxury-400" />
            <p className="mt-4 text-sm font-medium animate-pulse">Sahne hazırlanıyor...</p>
          </div>
        ) : concept.generatedImageBase64 ? (
          <>
            <img
              src={concept.generatedImageBase64}
              alt={concept.style}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Overlay Buttons */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
              <button
                onClick={() => onEdit(concept)}
                className="bg-white text-black px-3 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-luxury-50 transition-colors text-xs"
              >
                <Edit2 size={14} /> Düzenle
              </button>
              <button
                onClick={() => onRegenerate(concept)}
                className="bg-white/20 text-white backdrop-blur-sm px-3 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-white/30 transition-colors text-xs"
              >
                <RefreshCw size={14} /> Tekrar dene
              </button>
              <button
                onClick={handleDownload}
                className="bg-white/20 text-white backdrop-blur-sm p-2 rounded-full font-medium flex items-center justify-center hover:bg-white/30 transition-colors"
                title="İndir"
              >
                <Download size={14} />
              </button>
              <button
                onClick={() => onSave(concept)}
                className="bg-white text-luxury-900 p-2 rounded-full font-medium flex items-center justify-center hover:bg-luxury-50 transition-colors shadow-md"
                title="Galeriye Kaydet"
              >
                <Save size={14} />
              </button>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-luxury-300">
            Görsel kullanılamıyor
          </div>
        )}

        {/* Style Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-bold tracking-widest uppercase text-luxury-900 shadow-sm border border-luxury-100">
            {concept.style}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow bg-white">
        <p className="text-luxury-800 text-sm leading-relaxed mb-4 font-serif italic">
          "{concept.description}"
        </p>
        <div className="mt-auto pt-4 border-t border-luxury-50">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-luxury-400 mb-2">Kurulum Detayları</h4>
          <div className="flex flex-wrap gap-2">
            {concept.elements.map((item, i) => (
              <span key={i} className="inline-block px-2 py-1 bg-luxury-100 text-luxury-800 text-[10px] uppercase tracking-wide rounded-sm">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
