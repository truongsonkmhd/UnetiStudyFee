import { AnswerTemplate } from "./AnswerTemplate";

export interface QuestionTemplate {
  questionId?: string;
  content: string;
  questionOrder: number;
  timeLimitSeconds: number;
  points: number;
  answers: AnswerTemplate[];
}