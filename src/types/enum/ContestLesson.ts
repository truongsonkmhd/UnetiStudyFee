import { StatusContest } from "./StatusContest";

export interface ContestLesson {
  contestLessonId: string;
  title: string;
  description: string;
  defaultDurationMinutes?: number;
  totalPoints: number;
  defaultMaxAttempts?: number;
  passingScore?: number;
  showLeaderboardDefault: boolean;
  status: StatusContest;
  isActive: boolean;
  instructions?: string;
  codingExerciseCount: number;
  quizQuestionCount: number;
  createdAt: string;
  updatedAt: string;
}