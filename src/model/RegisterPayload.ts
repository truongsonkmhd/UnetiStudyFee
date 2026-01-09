export type RegisterPayload = {
  fullName: string;
  userName: string;
  password: string;
  email: string;
  phone?: string;
  type?: "STUDENT" | "TEACHER" | "ADMIN";
  gender?: "male" | "female" | "other";
  birthday?: string; // "11/14/2024" hoặc ISO tùy backend
  contactAddress?: string;
  currentResidence?: string;
  studentId: string;
  classId: string;
  roleCodes?: string[]; // ["STUDENT"]
};
