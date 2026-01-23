import { Gender } from "@/types/enum/Gender";

export type RegisterPayload = {
  fullName: string;
  userName: string;
  password: string;
  email: string;
  phone?: string;
  gender?: Gender;
  birthday?: string;
  contactAddress?: string;
  currentResidence?: string;
  studentId: string;
  classId: string;
  roleCodes?: string[];
};
