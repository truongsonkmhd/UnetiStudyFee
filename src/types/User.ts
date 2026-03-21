import { Gender } from "../components/enum/Gender";
import { Role } from "./Role";
import { UserStatus } from "../components/enum/UserStatus";
import { UserType } from "../components/enum/UserType";

export interface IBaseUser {
  id: string;
  fullName: string;
  gender: Gender;
  birthday: string;
  email: string;
  phone: string;
  username: string;
  avatar?: string;
  isDeleted: boolean;
  type: UserType;
  status: UserStatus;
  roles: Role[];
}

export interface IStudentProfile {
  studentId: string;
  classId: string;
  contactAddress?: string;
  currentResidence?: string;
}

export interface ITeacherProfile {
  teacherId: string;
  department: string;
  academicRank?: string;
  specialization?: string; 
}

export interface User extends IBaseUser {
  studentProfile?: IStudentProfile;
  teacherProfile?: ITeacherProfile;
  studentID?: string;
  classID?: string;
  teacherID?: string;
  department?: string;
  academicRank?: string;
  specialization?: string;
  contactAddress?: string;
  currentResidence?: string;
}

export interface UserPageResponse {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  users: User[];
}
