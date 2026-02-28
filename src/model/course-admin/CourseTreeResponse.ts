import { CourseStatus } from "@/types/enum/CourseStatus";
import { CourseModuleResponse } from "./CourseModuleResponse";

export interface CourseTreeResponse {
  courseId: string;
  title: string;
  slug: string;
  description: string;
  isPublished: boolean;
  publishedAt?: string;
  status: CourseStatus;
  imageUrl?: string;
  videoUrl?: string;
  level?: string;
  category?: string;
  subCategory?: string;
  capacity?: number;
  requirements?: string;
  objectives?: string;
  syllabus?: string;
  shortDescription?: string;
  modules: CourseModuleResponse[];
  enrolledCount?: number;
  rating?: number;
  ratingCount?: number;
  updatedAt?: string;
}