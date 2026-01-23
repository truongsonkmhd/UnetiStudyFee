import { UserInfo } from "@/model/UserInfo";

export interface JwtClaims {
  id: string | "";
  scope: string;
  classId: string;
  userName: string;
  userID: string;
  sub: string;
  iat: number;
  exp: number;
}
