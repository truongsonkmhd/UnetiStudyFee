export interface AddAnswerRequest {
  questionId: string;
  content: string;
  isCorrect: boolean;
}