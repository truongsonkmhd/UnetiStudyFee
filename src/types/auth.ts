export enum Role {
  ROLE_ADMIN = "ROLE_ADMIN",
  ROLE_SYS_ADMIN = "ROLE_SYS_ADMIN",
  ROLE_TEACHER = "ROLE_TEACHER",
  ROLE_STUDENT = "ROLE_STUDENT",
}
export const ROLES: Role[] = [
  Role.ROLE_ADMIN,
  Role.ROLE_SYS_ADMIN,
  Role.ROLE_TEACHER,
  Role.ROLE_STUDENT,
];

export interface LoginPayload {
  username: string;
  password: string;
  isRememberMe: boolean;
}

export interface LoginData {
  isAuthenticated: boolean;
  token: string;
  refreshToken: string;
}
