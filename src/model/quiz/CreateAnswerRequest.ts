export interface CreateAnswerRequest {
  content: string;
  answerOrder: number;
  isCorrect: boolean;
}