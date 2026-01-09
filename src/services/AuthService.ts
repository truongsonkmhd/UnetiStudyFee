import apiService from "@/apis/apiService";
import { decodeToken } from "@/components/common/decodeToken";
import { LoginData, LoginPayload } from "@/types/Auth";
import { JwtClaims } from "@/types/JwtClaims";

const LOGIN_ENDPOINT = "/authenticate";
const LOGOUT_ENDPOINT = "/authenticate/logout";
const REGISTER_ENDPOINT = "/authenticate/register";

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

  signUp: async () => {
    const response = await apiService.post<LoginData>(REGISTER_ENDPOINT);

    if (response?.token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, response.token);

      // nếu backend có refreshToken thì lưu
      if (response.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
      }
    }

    return response;
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

  clear: () => clearAuthStorage(),
};

export default authService;
