import { LessonType } from "@/types/enum/LessonType";
import { TemplateSelection } from "./TemplateSelection";

export interface CourseLessonRequest {
  lessonId?: string;
  moduleId?: string;
  creatorId?: string;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  videoFile?: File;
  duration?: number;
  orderIndex: number;
  isPreview: boolean;
  isPublished: boolean;
  slug?: string;
  lessonType: LessonType;

  exerciseTemplateIds?: string[];
  quizTemplateIds?: string[];

  // Store template info for UI display (not sent to backend)
  exerciseTemplates?: TemplateSelection[];
  quizTemplates?: TemplateSelection[];
}