import { AnswerTemplateResponse } from "./AnswerTemplateResponse";

export interface QuestionTemplateResponse {
  content: string;
  questionOrder: number;
  timeLimitSeconds: number;
  points: number;
  answers: AnswerTemplateResponse[];
}