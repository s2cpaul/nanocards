export interface NanoCard {
  id: string;
  title: string;
  objective?: string;
  videoTime: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  information?: string;
  likes: number;
  createdBy: string;
  createdAt: string;
  qrCodeUrl?: string;
  country?: string;
  stage?: string;
  category?: string;
  featuredLink?: {
    url: string;
    title: string;
  };
  additionalLinks?: Array<{
    url: string;
    title: string;
    duration?: string;
  }>;
  insights: {
    information?: string;
    whitePaper?: string;
    officialSite?: string;
    linkedin?: string;
    discord?: string;
    notion?: string;
    youtube?: string;
    github?: string;
    link?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    email?: string;
  };
  interactiveItems?: Array<{
    type: 'quiz' | 'survey' | 'knowledge';
    question: string;
    textLines?: string[]; // Array of text lines, max 256 chars each
    options?: string[]; // For quiz, survey, and knowledge check
    correctAnswer?: number; // For quiz and knowledge check (index of correct option)
    dragItems?: string[]; // For drag and drop
    dropZones?: string[]; // For drag and drop
    allowText?: boolean; // For survey - allows open-ended text response (256 chars)
  }>; // Max 3 items
}

export interface User {
  name: string;
  email: string;
  provider: 'gmail' | 'outlook';
}