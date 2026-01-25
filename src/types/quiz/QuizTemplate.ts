import { QuestionTemplate } from "./QuestionTemplate";

export interface QuizTemplate {
  templateId: string;
  templateName: string;
  description: string;
  category: string;
  thumbnailUrl?: string;
  passScore: number;
  timeLimitMinutes: number;
  isActive: boolean;
  usageCount: number;
  totalQuestions: number;
  version: number;

  questions: QuestionTemplate[];
  }