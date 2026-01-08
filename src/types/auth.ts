import { User } from "@/model/User";

export type Role = "admin" | "manager" | "staff";
export const ROLES: Role[] = ["admin", "manager", "staff"];

export interface LoginPayload {
  username: string;
  password: string;
  isRememberMe: boolean;
}

export interface LoginData {
  isAuthenticated: boolean;
  token: string;
  refreshToken: string;
  user: User;
}
