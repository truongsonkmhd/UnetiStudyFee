import { UserType } from "@/components/enum/UserType";
import { Gender } from "./Gender";
import { UserStatus } from "@/components/enum/UserStatus";
import { Role } from "@/types/Role";

export interface User {
  id?: string;
  fullName?: string;
  gender?: Gender;
  birthday?: string;
  email?: string;
  phone?: string;
  username: string;
  password?: string;
  avatar?: string;

  studentId: string;
  contactAddress?: string;
  currentResidence?: string;
  classId: string;

  isDeleted?: boolean;
  type?: UserType;
  status?: UserStatus;

  roles?: Role[];
}
