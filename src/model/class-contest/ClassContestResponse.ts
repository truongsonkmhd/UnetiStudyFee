import { ClassContestStatus } from "@/types/enum/ClassContestStatus";

export interface ClassContestResponse {
  classContestId: string;
  classInfo: {
    classId: string;
    classCode: string;
    className: string;
    instructorName: string;
  };
  contestInfo: {
    contestLessonId: string;
    title: string;
    description: string;
    defaultTotalPoints: number;
    codingExerciseCount: number;
    quizQuestionCount: number;
  };
  scheduledStartTime: string;
  scheduledEndTime: string;
  durationInMinutes: number;
  status: ClassContestStatus;
  isActive: boolean;
  weight: number;
  effectiveConfig: {
    maxAttempts: number;
    showLeaderboard: boolean;
    instructions: string;
    passingScore: number;
    totalPoints: number;
  };
  createdAt: string;
  updatedAt: string;
}