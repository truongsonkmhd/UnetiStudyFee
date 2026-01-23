import { Answer } from "./Answer";

export interface Question {
  questionId?: string;
  content: string;
  questionOrder: number;
  timeLimitSeconds: number;
  points: number;
  answers: Answer[];
}