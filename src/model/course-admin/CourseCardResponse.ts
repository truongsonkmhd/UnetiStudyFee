export interface CourseCardResponse {
  courseId: string;
  title: string;
  slug: string;
  shortDescription: string;
  imageUrl?: string;
  isPublished: boolean;
  totalModules: number;
  publishedAt?: string;
  enrolledCount?: number;
  instructorName?: string;
}