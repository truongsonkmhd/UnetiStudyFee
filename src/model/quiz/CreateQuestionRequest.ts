import { CreateAnswerRequest } from "./CreateAnswerRequest";

export interface CreateQuestionRequest {
  content: string;
  questionOrder: number;
  timeLimitSeconds?: number;
  points?: number;
  answers: CreateAnswerRequest[];
}
