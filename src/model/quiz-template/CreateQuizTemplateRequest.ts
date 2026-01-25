import { CreateQuestionTemplateRequest } from "./CreateQuestionTemplateRequest";

export interface CreateQuizTemplateRequest {
  
  templateName: string;
  description: string;
  category: string;
  thumbnailUrl?: string;
  passScore: number;
  timeLimitMinutes: number;
  questions: CreateQuestionTemplateRequest[];
}
