export interface Writing {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  type: 'previous' | 'new_draft';
  wordCount: number;
}

export interface RhetoricalFigure {
  name: string;
  count: number;
  examples: string[];
}

export interface StyleProfile {
  voicePatterns: string[];
  fillers: string[];
  rhetoricalFigures: RhetoricalFigure[];
  tone: string;
  sentenceStructure: string;
  vocabularyRichness: number;
  lastUpdated: number;
  totalWritingsAnalyzed: number;
}

export interface StyleSuggestion {
  original: string;
  suggested: string;
  reason: string;
}

export interface Evaluation {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  fidelityScore: number;
  feedback: string;
  detectedFillers: string[];
  suggestions: StyleSuggestion[];
  detectedFigures: string[];
}
