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
  type: UserType;
  status: UserStatus;
  roles: Role[];
}
