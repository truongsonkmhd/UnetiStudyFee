export interface ExerciseTestCase {
  testCaseId?: string;
  input: string;
  expectedOutput: string;
  isSample: boolean;
  points?: number;
  explanation?: string;
  orderIndex?: number;
}