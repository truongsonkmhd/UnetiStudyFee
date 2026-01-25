import { CreateAnswerTemplateRequest } from "./CreateAnswerTemplateRequest";

export interface CreateQuestionTemplateRequest {
  content: string;
  questionOrder: number;
  timeLimitSeconds: number;
  points: number;
  answers: CreateAnswerTemplateRequest[];
}