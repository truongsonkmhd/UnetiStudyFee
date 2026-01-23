export interface QuizSummaryResponse {
  quizId: string;
  title: string;
  totalQuestions: number;
  passScore: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}