import { StatusContest } from "@/types/enum/StatusContest";

export interface ContestLessonSummary {
  contestLessonId: string;
  title: string;
  description?: string;
  totalPoints: number;
  defaultDurationMinutes?: number;
  codingExerciseCount: number;
  quizQuestionCount: number;
  status: StatusContest;
  isActive: boolean;
  activeClassCount: number;
  createdAt: string;
  updatedAt: string;
}
