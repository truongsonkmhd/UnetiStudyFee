export interface ClasssContest {
  classId: string;
  classCode: string;
  className: string;
  instructor: {
    userId: string;
    username: string;
    email: string;
  };
  startDate: string;
  endDate?: string;
  maxStudents?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  studentCount?: number;
  contestCount?: number;
}
