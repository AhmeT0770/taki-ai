import React, { useState, useEffect } from 'react';
import { X, Sparkles, Send } from 'lucide-react';
import { PhotoConcept } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  concept: PhotoConcept | null;
  onConfirmEdit: (conceptId: string, prompt: string) => Promise<void>;
}

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ 
  isOpen, 
  onClose, 
  concept, 
  onConfirmEdit 
}) => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPrompt('');
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen || !concept || !concept.generatedImageBase64) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsProcessing(true);
    try {
      await onConfirmEdit(concept.id, prompt);
      setPrompt(''); 
    } catch (error) {
      console.error("Düzenleme başarısız oldu", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const suggestions = [
      "Sıcak altın gün batımı ışığı ekle",
      "Siyah kadife fonda sergile",
      "Su halkası yansımaları ekle",
      "Arka planı tamamen beyaz yap",
      "Yumuşak çiçek gölgeleri ekle"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-luxury-900/90 backdrop-blur-sm transition-opacity" 
        onClick={!isProcessing ? onClose : undefined}
      />

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-sm shadow-2xl flex flex-col md:flex-row">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          disabled={isProcessing}
          className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-colors border border-white/20"
        >
          <X size={20} />
        </button>

        {/* Left: Image View */}
        <div className="w-full md:w-2/3 bg-luxury-900 relative flex items-center justify-center min-h-[400px]">
          <img 
            src={concept.generatedImageBase64} 
            alt="Güncel kare" 
            className="max-h-full max-w-full object-contain shadow-2xl"
          />
          {isProcessing && (
             <div className="absolute inset-0 bg-luxury-900/50 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                <LoadingSpinner size="lg" color="border-white" />
                <p className="mt-4 font-serif text-xl tracking-wide">İşleniyor...</p>
             </div>
          )}
        </div>

        {/* Right: Controls */}
        <div className="w-full md:w-1/3 p-6 md:p-8 flex flex-col bg-white">
          <h3 className="font-serif text-2xl font-bold text-luxury-900 mb-2">Kareyi İyileştir</h3>
          <p className="text-luxury-500 text-sm mb-6">
            YZ fotoğrafçısına talimat verin. Işığı, arka planı ya da atmosferi nasıl değiştirmek istediğinizi anlatın.
          </p>
          <div className="space-y-4 mb-8">
             <h4 className="text-[10px] font-bold uppercase tracking-wider text-luxury-400">Hızlı Dokunuşlar</h4>
             <div className="flex flex-wrap gap-2">
                {suggestions.map((ex) => (
                  <button 
                    key={ex}
                    type="button"
                    disabled={isProcessing}
                    onClick={() => setPrompt(ex)}
                    className="text-xs bg-luxury-50 hover:bg-luxury-100 text-luxury-800 px-3 py-2 rounded-sm transition-colors text-left border border-luxury-100"
                  >
                    {ex}
                  </button>
                ))}
             </div>
          </div>



          <form onSubmit={handleSubmit} className="mt-auto">
            <label htmlFor="edit-prompt" className="block text-sm font-medium text-luxury-800 mb-2">
              Özel Talimat
            </label>
            <div className="relative">
              <input
                id="edit-prompt"
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="örn. Altını daha parlak göster..."
                className="w-full pl-4 pr-12 py-3 bg-luxury-50 border border-luxury-200 rounded-sm focus:ring-1 focus:ring-luxury-400 focus:border-luxury-400 outline-none transition-shadow"
                disabled={isProcessing}
              />
              <button 
                type="submit" 
                disabled={!prompt.trim() || isProcessing}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-luxury-500 hover:text-luxury-900 disabled:text-gray-300 p-2"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
          
          <div className="mt-6 pt-6 border-t border-luxury-100 flex items-center gap-2 text-xs text-luxury-400">
             <Sparkles size={14} />
             <span>Gemini 2.5 Flash Image tarafından destekleniyor</span>
          </div>
        </div>
      </div>
    </div>
  );
};
