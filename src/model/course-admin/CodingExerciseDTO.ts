import { Difficulty } from "../coding-template/Difficulty";

export interface CodingExerciseDTO {
  contestLessonId: string | null;
  templateId?: string;
  title: string;
  description: string;
  programmingLanguage: string;
  difficulty: Difficulty;
  points: number;
  isPublished: boolean;
  timeLimitMs: number;
  memoryLimitMb: number;
  slug: string;
  inputFormat?: string;
  outputFormat?: string;
  constraintName?: string;
  createdAt?: string;
  updatedAt?: string;
}