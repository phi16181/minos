export type Phase = 'scope' | 'generating' | 'challenge' | 'complete';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Level {
  id: number;
  title: string;
  difficulty: Difficulty;
  topics: string[];
  situation: string;
  task: string;
  optimalAnswer: string;
  socratiqueHint: string;
  commonMistake: string;
}

export interface Decision {
  level: number;
  title: string;
  summary: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface AppState {
  phase: Phase;
  scope: string;
  optimalPlan: string;
  levels: Level[];
  currentLevelIndex: number;
  decisions: Decision[];
  conversationHistory: { role: 'user' | 'assistant'; content: string }[];
  levelComplete: boolean;
  hintVisible: boolean;
  hintText: string;
  hintLoading: boolean;
  submitLoading: boolean;
  journeySummary: string;
}
