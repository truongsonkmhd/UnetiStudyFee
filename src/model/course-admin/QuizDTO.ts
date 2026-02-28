export interface QuizDTO {
  quizId: string;
  lessonId: string | null;
  templateId?: string;
  title: string;
  totalQuestions: number;
  passScore: number;
  isPublished: boolean;
  maxAttempts?: number;
  totalPoints?: number;
}