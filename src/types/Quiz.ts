import { Question } from "./Question";

export interface Quiz {
  quizId?: string;
  title: string;
  totalQuestions?: number;
  passScore: number;
  isPublished: boolean;
  contestLessonId: string;
  createdAt?: string;
  updatedAt?: string;
  questions: Question[];
}
