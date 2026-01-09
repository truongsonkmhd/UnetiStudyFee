import { UserType } from "@/model/UserType";
import { Gender } from "./Gender";
import { UserStatus } from "@/model/UserStatus";
import { Role } from "./Auth";

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
