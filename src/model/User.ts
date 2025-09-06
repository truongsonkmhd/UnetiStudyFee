import { Gender } from "./Gender";
import { Role } from "./Role";
import { UserStatus } from "./UserStatus";
import { UserType } from "./UserType";

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
