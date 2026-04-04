import { CourseStatus } from "@/types/enum/CourseStatus";
import { CourseModuleRequest } from "./CourseModuleRequest";

export interface CourseShowRequest {
  title: string;
  description: string;
  shortDescription: string;
  level: string;
  category: string;
  subCategory?: string;
  capacity?: number;
  enrolledCount?: number;
  imageFile?: File;
  videoUrl?: string;
  status: CourseStatus;
  isPublished: boolean;
  publishedAt?: string;
  modules: CourseModuleRequest[];
  learningOutcomes?: string[];
  duration?: number;
  requirements?: string;
  objectives?: string;
  syllabus?: string;
}