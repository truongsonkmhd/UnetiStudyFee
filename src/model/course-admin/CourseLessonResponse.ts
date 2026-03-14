import { LessonType } from "@/types/enum/LessonType";
import { CodingExerciseDTO } from "./CodingExerciseDTO";
import { QuizDTO } from "./QuizDTO";

export interface CourseLessonResponse {
  lessonId: string;
  slug: string;
  title: string;
  description?: string;
  content?: string;
  orderIndex: number;
  lessonType: LessonType;
  isPreview: boolean;
  isPublished: boolean;
  videoUrl?: string;       // Embed URL (YouTube) hoặc PocketBase URL (cũ)
  youtubeVideoId?: string; // Video ID thuần, ví dụ: "DjlGte968ko"
  embedUrl?: string;       // Embed URL sẵn sàng nhúng iframe
  codingExercises: CodingExerciseDTO[];
  quizzes: QuizDTO[];

  totalPoints?: number;
}
