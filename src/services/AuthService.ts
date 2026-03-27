import apiService from "@/apis/apiService";
import { decodeToken } from "@/components/common/decodeToken";
import { ApiResponse } from "@/model/common/ApiResponse";
import { RegisterPayload } from "@/model/payload/RegisterPayload";
import { LoginData, LoginPayload } from "@/types/auth";
import { JwtClaims } from "@/types/JwtClaims";

const LOGIN_ENDPOINT = "/authenticate";
const LOGOUT_ENDPOINT = "/authenticate/logout";
const REGISTER_ENDPOINT = "/authenticate/register";
const FORGOT_PASSWORD_REQUEST = "/authenticate/forgot-password/request";
const FORGOT_PASSWORD_VERIFY = "/authenticate/forgot-password/verify";
const FORGOT_PASSWORD_RESET = "/authenticate/forgot-password/reset";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

function getStorageByRememberMe(isRememberMe?: boolean) {
  return isRememberMe ? localStorage : sessionStorage;
}

function getTokenFromAnyStorage(key: string): string | null {
  return localStorage.getItem(key) || sessionStorage.getItem(key);
}

function clearAuthStorage() {
  // Local
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem("debug");

  // Session
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem("debug");
}

const authService = {
  login: async (payload: LoginPayload): Promise<LoginData> => {
    const response = await apiService.post<LoginData>(LOGIN_ENDPOINT, payload);

    if (response?.token) {
      const storage = getStorageByRememberMe(payload.isRememberMe);
      storage.setItem(ACCESS_TOKEN_KEY, response.token);

      // nếu backend có refreshToken thì lưu
      if (response.refreshToken) {
        storage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      }
    }

    return response;
  },

  logout: async (): Promise<void> => {
    try {
      await apiService.post<string>(LOGOUT_ENDPOINT);
      console.log("Server logout successful.");
    } catch (error) {
      console.error(
        "Lỗi khi gọi API đăng xuất, nhưng vẫn sẽ tiếp tục xóa token ở client:",
        error
      );
    } finally {
      clearAuthStorage();
      console.log("Client tokens cleared.");
    }
  },

  signUp: async (payload: RegisterPayload): Promise<LoginData> => {
    const data = await apiService.post<LoginData>(REGISTER_ENDPOINT, payload);

    console.log("Received registration response:", data);

    if (data?.token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, data.token);

      // nếu backend có refreshToken thì lưu
      if (data.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      }
    }

    console.log("Registration successful:", data);

    return data;
  },

  getJwtClaimDecoded: (): JwtClaims | null => {
    const token = getTokenFromAnyStorage(ACCESS_TOKEN_KEY);
    console.log("Getting JWT claims from stored token.");

    if (!token) return null;
    return decodeToken(token);
  },

  getAccessToken: (): string | null => getTokenFromAnyStorage(ACCESS_TOKEN_KEY),
  getRefreshToken: (): string | null =>
    getTokenFromAnyStorage(REFRESH_TOKEN_KEY),

  forgotPasswordRequest: (email: string) => {
    return apiService.post(FORGOT_PASSWORD_REQUEST, { email });
  },

  verifyOtp: (email: string, otp: string) => {
    return apiService.post(FORGOT_PASSWORD_VERIFY, { email, otp });
  },

  resetPassword: (payload: any) => {
    return apiService.post(FORGOT_PASSWORD_RESET, payload);
  },

  clear: () => clearAuthStorage(),
};

export default authService;
