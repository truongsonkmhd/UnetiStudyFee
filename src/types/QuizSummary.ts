export interface QuizSummary {
  quizId: string;
  title: string;
  totalQuestions: number;
  passScore: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}
