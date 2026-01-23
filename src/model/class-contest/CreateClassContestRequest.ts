export interface CreateClassContestRequest {
  classId: string;
  contestLessonId: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  weight?: number;
  maxAttemptsOverride?: number;
  showLeaderboardOverride?: boolean;
  instructionsOverride?: string;
  passingScoreOverride?: number;
  isActive?: boolean;
}
