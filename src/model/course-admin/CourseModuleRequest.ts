import { CourseLessonRequest } from "./CourseLessonRequest";

export interface CourseModuleRequest {
  moduleId?: string;
  lessonId?: string;
  title: string;
  description?: string;
  orderIndex: number;
  duration?: number;
  isPublished: boolean;
  slug?: string;
  lessons: CourseLessonRequest[];
}
