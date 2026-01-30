export interface QuizDTO {
  quizId: string;
  lessonId: string | null;
  title: string;
  totalQuestions: number;
  passScore: number;
  isPublished: boolean;
}