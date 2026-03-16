import { UserType } from "@/components/enum/UserType";
import { Gender } from "./enum/Gender";
import { UserStatus } from "@/components/enum/UserStatus";
import { Role } from "@/types/Role";

import { IBaseUser, IStudentProfile, ITeacherProfile } from "./User";

export interface User extends Partial<IBaseUser> {
  username: string;
  password?: string;

  // Profiles
  studentProfile?: IStudentProfile;
  teacherProfile?: ITeacherProfile;

  // Legacy flat fields for compatibility
  studentId?: string;
  classId?: string;
  contactAddress?: string;
  currentResidence?: string;
}
