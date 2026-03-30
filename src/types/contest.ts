export interface ContestSessionResponse {
  submissionId: string;
  classContestId: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  timeLeftSeconds: number;
  status: string;
  items: ContestItemDTO[];
}

export interface ContestItemDTO {
  id: string;
  type: "CODING" | "QUIZ";
  title: string;
  content: string;
  points: number;
  // Quiz
  options?: QuizOptionDTO[];
  // Coding
  programmingLanguage?: string;
  initialCode?: string;
  slug?: string;
}

export interface QuizOptionDTO {
  id: string;
  text: string;
}

export interface CodingAnswer {
  code: string;
  language: string;
}

export interface ContestSubmissionRequest {
  quizAnswers: Record<string, string[]>;       // questionId -> list of selected answerIds
  codingAnswers: Record<string, CodingAnswer>; // exerciseId -> { code, language }
}

export interface ContestSubmissionResult {
  submissionId: string;
  quizScore: number;
  codingScore: number;
  totalScore: number;
  maxScore: number;
  passed: boolean;
  message?: string;
}

