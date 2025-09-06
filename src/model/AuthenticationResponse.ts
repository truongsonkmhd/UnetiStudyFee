import { User } from "./User";

export interface AuthenticationResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
  tokenType: string;
}
