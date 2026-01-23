import { AddressRequest } from "./AddressRequest";
import { Gender } from "../types/enum/Gender";

export interface UserRequest {
  fullName: string; // @NotBlank
  gender: Gender; // MALE | FEMALE | OTHER
  birthday: string; // Java Date => string (ISO hoặc "MM/dd/yyyy")
  username: string; // @NotNull
  password: string; // @NotNull
  email: string; // @Email
  phone: string; // @PhoneNumber
  type: string; // UserType (ADMIN, STUDENT, TEACHER, …)
  addresses: AddressRequest[]; // @NotEmpty
}
