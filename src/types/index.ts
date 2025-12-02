export interface Topic {
  folder: string;
  icon: string;
  name: string;
  files: string[];
  count: number;
}

export interface Manifest {
  [key: string]: Topic;
}

export interface FlashcardData {
  Q: string;
  A: string;
}

export interface QAContent {
  path: string;
  content: string;
  error?: string | null;
}

export interface StudySession {
  cardsStudied: number;
  correct: number;
  incorrect: number;
  startTime: number;
}

export interface StudyProgress {
  lastStudied: string;
  totalCards: number;
  masteredCards: number;
  streak: number;
}

export type ViewMode = 'home' | 'flashcards' | 'browse' | 'challenges' | 'stats';

export interface SearchResult {
  topic: string;
  file: string;
  title: string;
  snippet: string;
}
