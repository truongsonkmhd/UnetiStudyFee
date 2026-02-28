import { CourseLessonResponse } from "./CourseLessonResponse";

export interface CourseModuleResponse {
  moduleId: string;
  slug: string;
  title: string;
  orderIndex: number;
  isPublished: boolean;
  lessons: CourseLessonResponse[];
}