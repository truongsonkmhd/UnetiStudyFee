import { QuestionTemplate } from "./QuestionTemplate";

export interface QuizTemplate {
  templateId: string;
  templateName: string;
  description: string;
  category: string;
  thumbnailUrl?: string;
  passScore: number;
  isActive: boolean;
  usageCount: number;
  totalQuestions: number;
  version: number;
  maxAttempts?: number;

  questions: QuestionTemplate[];
}