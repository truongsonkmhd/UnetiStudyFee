import { Gender } from "../types/enum/Gender";
import { RoleResponse } from "./RoleResponse";

export interface UserInfo {
  userId: string;
  fullName: string;
  avatar: string;
  gender: string;
  birthday: string;
  email: string;
  phone: string;
  username: string;
  classId: string;
  studentId: string | null;
  contactAddress: string | null;
  currentResidence: string | null;
}
