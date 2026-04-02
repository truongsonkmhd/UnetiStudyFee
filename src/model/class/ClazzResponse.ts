import { ClassContestResponse } from "../class-contest/ClassContestResponse";

export interface ClazzResponse {
  classId?: string;
  classCode?: string;
  className?: string;
  inviteCode?: string;
  instructorId?: string;
  instructorName?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
  maxStudents?: number;
  studentCount?: number;
  isActive?: boolean;
  contests?: ClassContestResponse[];
}