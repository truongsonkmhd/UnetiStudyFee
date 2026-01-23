import { AnswerResponse } from "./AnswerResponse";

export interface QuestionResponse {
  questionId: string;
  content: string;
  questionOrder: number;
  timeLimitSeconds: number;
  points: number;
  answers: AnswerResponse[];
}
