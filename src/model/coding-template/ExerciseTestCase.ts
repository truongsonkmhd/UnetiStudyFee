export interface ExerciseTestCase {
  testCaseId?: string;
  input: string;
  expectedOutput: string;
  isPublic: boolean;
  explanation?: string;
  orderIndex?: number;
}