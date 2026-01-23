export interface ClassSummary {
  classId: string;
  classCode: string;
  className: string;
  instructorName: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  studentCount: number;
  activeContestCount: number;
}