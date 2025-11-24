import React, { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { Button } from './Button';

interface SaveImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => Promise<void>;
    imageUrl: string | undefined;
}

export const SaveImageModal: React.FC<SaveImageModalProps> = ({ isOpen, onClose, onSave, imageUrl }) => {
    const [name, setName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSaving(true);
        try {
            await onSave(name);
            setName('');
            onClose();
        } catch (error) {
            console.error('Kaydetme hatası:', error);
            alert('Kaydetme sırasında bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative bg-white w-full max-w-md rounded-sm shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <h3 className="text-xl font-serif font-bold text-luxury-900 mb-4">Galeriye Kaydet</h3>

                <div className="mb-6 flex justify-center">
                    {imageUrl && (
                        <img
                            src={imageUrl}
                            alt="Önizleme"
                            className="h-40 w-40 object-cover rounded-sm shadow-md border border-luxury-100"
                        />
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label htmlFor="imageName" className="block text-sm font-medium text-luxury-700 mb-2">
                            Görsel İsmi *
                        </label>
                        <input
                            type="text"
                            id="imageName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Örn: Altın Kolye - Minimal Stüdyo"
                            className="w-full px-4 py-3 border border-luxury-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-luxury-500 focus:border-transparent transition-all"
                            autoFocus
                            required
                        />
                        <p className="mt-2 text-xs text-luxury-400">Galeride bu isimle gösterilecek</p>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            disabled={isSaving}
                        >
                            İptal
                        </Button>
                        <Button
                            type="submit"
                            disabled={!name.trim() || isSaving}
                            isLoading={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={16} />
                                    Kaydediliyor...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2" size={16} />
                                    Galeriye Kaydet
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
