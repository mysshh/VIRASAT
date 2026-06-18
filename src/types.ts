export type EntryType = 'remedy' | 'recipe';

export interface RecipeEntry {
  id: string;
  type: EntryType;
  title: string;
  category: string;
  origin: string;
  language: string;
  creator: string;
  description: string;
  benefits?: string;
  ingredients: string[];
  instructions: string[];
  mediaType: 'text' | 'video' | 'audio';
  mediaUrl?: string; // YouTube/Vimeo embed or links
  audioBase64?: string; // Recorded audio Data URL
  transcribedText?: string; // Gemini-transcribed text
  createdAt: string;
  likes: number;
}

export interface CommentEntry {
  id: string;
  entryId: string;
  author: string;
  rating: number; // 1-5
  commentText: string;
  tips?: string; // specific implementation/modification tips
  language: string;
  createdAt: string;
}

export interface TranslationResponse {
  translatedTitle: string;
  translatedDescription: string;
  translatedBenefits?: string;
  translatedIngredients: string[];
  translatedInstructions: string[];
}
