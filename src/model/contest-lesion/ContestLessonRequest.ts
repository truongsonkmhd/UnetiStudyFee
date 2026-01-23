export interface ContestLessonRequest {
  title: string;
  description?: string;
  defaultDurationMinutes?: number;
  totalPoints: number;
  defaultMaxAttempts?: number;
  passingScore?: number;
  showLeaderboardDefault?: boolean;
  instructions?: string;
  exerciseTemplateIds?: string[];
}