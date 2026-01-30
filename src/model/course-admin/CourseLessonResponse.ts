import { LessonType } from "@/types/enum/LessonType";
import { CodingExerciseDTO } from "./CodingExerciseDTO";
import { QuizDTO } from "./QuizDTO";

export interface CourseLessonResponse {
  lessonId: string;
  title: string;
  description?: string;
  content?: string;
  orderIndex: number;
  lessonType: LessonType;
  isPreview: boolean;
  isPublished: boolean;
  videoUrl?: string;
  codingExercises: CodingExerciseDTO[];
  quizzes: QuizDTO[];

  totalPoints?: number;
}
