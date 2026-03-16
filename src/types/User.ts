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
  academicRank?: string; // e.g., Thạc sĩ, Tiến sĩ
  specialization?: string; // Chuyên môn
}

export interface User extends IBaseUser {
  studentProfile?: IStudentProfile;
  teacherProfile?: ITeacherProfile;
  // Giữ lại các trường phẳng (flat fields) để tương thích ngược nếu cần, 
  // nhưng khuyến khích dùng Profile
  studentId?: string;
  classId?: string;
}
