
export type QuestionType = 'single' | 'multi';

export interface Option {
  id: string;
  text: string;
  score: number;
}

export interface Question {
  id: string;
  quizId: string;
  text: string;
  type: QuestionType;
  position: number;
  options: Option[];
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface Answer {
  questionId: string;
  optionIds: string[]; // Supports multi-select
}

export interface Submission {
  id: string;
  quizId: string;
  totalScore: number;
  submittedAt: string;
  answers: Answer[];
}

export interface DashboardStats {
  totalSubmissions: number;
  averageScore: number;
  scoreDistribution: { range: string; count: number }[];
  questionStats: {
    questionText: string;
    options: { text: string; count: number }[];
  }[];
}
