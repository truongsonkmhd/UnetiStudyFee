import { Gender } from "../components/enum/Gender";
import { Role } from "./Role";
import { UserStatus } from "../components/enum/UserStatus";
import { UserType } from "../components/enum/UserType";

export interface User {
  id: string;
  fullName: string;
  gender: Gender;
  birthday: string;
  email: string;
  phone: string;
  username: string;
  avatar?: string;
  isDeleted: boolean;
  currentResidence?: string;
  contactAddress?: string;
  type: UserType;
  status: UserStatus;
  roles: Role[];

  // Student fields
  studentCode?: string;
  classCode?: string;
  
  // Teacher fields
  teacherID?: string;
  department?: string;
  academicRank?: string;
  specialization?: string;
  
  // Legacy fields (optional)
  studentID?: string;
  classID?: string;
}

export interface UserPageResponse {
  pageNumber: number
  pageSize: number
  totalPages: number
  totalElements: number
  users: User[]
}