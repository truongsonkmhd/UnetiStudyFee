export interface UpdateQuizTemplateRequest {
  version: number;
  templateName?: string;
  description?: string;
  category?: string;
  thumbnailUrl?: string;
  passScore?: number;
  timeLimitMinutes?: number;
  isActive?: boolean;
}