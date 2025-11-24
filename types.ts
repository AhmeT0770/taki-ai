export enum PhotoStyle {
  MINIMALIST = 'Stüdyo Minimal',
  LUXURY = 'Koyu Lüks',
  NATURE = 'Doğa & Doku'
}

export interface PhotoConcept {
  id: string;
  style: PhotoStyle;
  description: string;
  generatedImageBase64?: string;
  isLoadingImage: boolean;
  elements: string[]; // Aksesuarlar, ışık öğeleri vb.
}

export interface PhotoPlanResponse {
  concepts: {
    style: string; // Enum ile eşleşecek
    description: string;
    elements: string[];
  }[];
}

export type GenerationStatus = 'idle' | 'analyzing' | 'generating' | 'complete' | 'error';
