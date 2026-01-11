import { AddressRequest } from "./AddressRequest";
import { Gender } from "../types/Gender";

export interface UserUpdateRequest {
  fullName?: string;
  gender?: Gender; // "MALE" | "FEMALE" | "OTHER"
  birthday?: string; // Java Date -> string ("MM/dd/yyyy" hoặc ISO)
  username?: string;
  email?: string;
  phone?: string;
  addresses?: AddressRequest[]; // Set<AddressRequest> -> AddressRequest[]
  roles?: string[]; // List<String>
}
