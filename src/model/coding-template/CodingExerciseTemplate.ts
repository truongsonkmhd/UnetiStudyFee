import { Difficulty } from "./Difficulty";
import { ExerciseTestCase } from "./ExerciseTestCase";

export interface CodingExerciseTemplate {
  templateId?: string;
  title: string;
  description: string;
  programmingLanguage: string;
  difficulty: Difficulty;
  points: number;
  isPublished: boolean;
  timeLimitMs: number;
  memoryLimitMb: number;
  initialCode: string;
  solutionCode?: string;
  slug: string;
  inputFormat?: string;
  outputFormat?: string;
  constraintName?: string;
  category?: string;
  tags?: string;
  createdAt?: string;
  updatedAt?: string;
  testCases?: ExerciseTestCase[];
}