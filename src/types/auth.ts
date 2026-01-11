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
