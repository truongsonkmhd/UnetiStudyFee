import { UserInfo } from "@/model/UserInfo";

export interface JwtClaims {
  id: string | "";
  scope: string;
  userInfor: UserInfo;
  sub: string;
  iat: number;
  exp: number;
}
