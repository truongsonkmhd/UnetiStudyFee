import { CreateAnswerRequest } from "./CreateAnswerRequest";

export interface AddQuestionRequest {
  quizId: string;
  content: string;
  timeLimitSeconds?: number;
  points?: number;
  answers: CreateAnswerRequest[];
}