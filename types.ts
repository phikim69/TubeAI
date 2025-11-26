
export interface TitleSuggestion {
  text: string;
  hookType: string; // e.g., "Curiosity", "Urgency", "How-to"
  score: number; // 1-100 predicted CTR potential
}

export interface VideoScript {
  intro: string;
  mainContent: string[];
  callToAction: string;
}

export interface VideoDetails {
  hashtags: string[];
  keywords: string[];
  seoTips: string[];
  visualPrompt: string; 
  description: string;
  script?: VideoScript; // New optional script field
}

export type ImageModelId = 
  | 'gemini-2.5-flash-image'
  | 'gemini-3-pro-image-preview'
  | 'imagen-3.0-generate-001'
  | 'imagen-4.0-generate-001';

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '3:4';

export type Language = 'Auto' | 'Vietnamese' | 'English' | 'Spanish' | 'Japanese' | 'Korean' | 'French' | 'German' | 'Indonesian';

export interface AppState {
  originalInput: string;
  isLoadingTitles: boolean;
  isLoadingDetails: boolean;
  isLoadingScript: boolean; // New loading state
  isLoadingAnalysis: boolean; // Vision AI loading
  titles: TitleSuggestion[];
  selectedTitle: TitleSuggestion | null;
  videoDetails: VideoDetails | null;
  currentVisualPrompt: string;
  generatedImageBase64: string | null;
  thumbnailHistory: string[]; // History array
  error: string | null;
  selectedImageModel: ImageModelId;
  selectedAspectRatio: AspectRatio;
  language: Language;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}
