export type Question = {
  question: string;
  options: string[];
  answer: string;
  /** Explication affichée après validation */
  explanation?: string;
  points?: number;
};
export type QuizFile = {
  title: string;
  category: string;
  description?: string;
  questions: Question[];
};
