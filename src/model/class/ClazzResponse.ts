import { ClassContestResponse } from "../class-contest/ClassContestResponse";

export interface ClazzResponse {
  classId?: string;
  classCode?: string;
  className?: string;
  instructorId?: string;
  instructorName?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
  maxStudents?: number;
  isActive? : boolean;
  contests? : ClassContestResponse[];
}