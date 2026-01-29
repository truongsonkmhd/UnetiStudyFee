export interface ContestLessonRequest {
  title: string;
  description?: string;
  durationMinutes?: number;
  totalPoints?: number;
  maxAttempts?: number;
  passingScore?: number;
  showLeaderboard?: boolean;
  instructions?: string;
  exerciseTemplateIds?: string[];
  quizTemplateIds?: string[];
}