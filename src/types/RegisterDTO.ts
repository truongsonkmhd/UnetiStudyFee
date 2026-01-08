import { AddressDTO } from "./AddressDTO";

export interface RegisterDTO {
  fullName?: string;
  userName: string;
  masv?: number;
  password: string;
  email: string;
  phone?: string;
  gender?: "male" | "female" | "other";
  birthday?: string;
  addresses?: AddressDTO[];
}
