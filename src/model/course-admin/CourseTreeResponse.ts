import { CourseStatus } from "@/types/enum/CourseStatus";
import { CourseModuleResponse } from "./CourseModuleResponse";

export interface CourseTreeResponse {
  courseId: string;
  title: string;
  slug: string;
  description: string;
  isPublished: boolean;
  status: CourseStatus;
  imageUrl?: string;
  videoUrl?: string;
  modules: CourseModuleResponse[];
}