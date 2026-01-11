import { Gender } from "../types/Gender";
import { RoleResponse } from "./RoleResponse";

export interface UserResponse {
  id: string; // UUID
  fullName: string;
  gender: Gender;
  birthday: string; // ISO date string
  username: string;
  email: string;
  phone: string;
  roles: RoleResponse[];
}
