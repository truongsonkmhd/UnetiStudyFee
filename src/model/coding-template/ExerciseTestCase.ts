export interface ExerciseTestCase {
  testCaseId?: string;
  input: string;
  expectedOutput: string;
  isSample: boolean;
  explanation?: string;
  orderIndex?: number;
}