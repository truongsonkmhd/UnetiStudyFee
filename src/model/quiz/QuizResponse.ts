import { QuestionResponse } from "./QuestionResponse";

export interface QuizResponse {
  quizId: string;
  title: string;
  description?: string;
  totalQuestions: number;
  passScore: number;
  isPublished: boolean;
  contestLessonId: string;
  createdAt: string;
  updatedAt: string;
  questions: QuestionResponse[];
}