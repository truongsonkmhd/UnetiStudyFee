import { CreateQuestionRequest } from "./CreateQuestionRequest";

export interface CreateQuizRequest {
  title: string;
  description?: string;
  contestLessonId: string;
  passScore: number;
  isPublished?: boolean;
  questions: CreateQuestionRequest[];
}