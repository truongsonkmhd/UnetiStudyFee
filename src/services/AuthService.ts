import { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { BaseService } from "./BaseService";
import { AuthenticationResponse } from "@/model/AuthenticationResponse";
import { AuthServiceResponse } from "@/model/AuthServiceResponse";
import { IResponseMessage } from "@/model/IResponseMessage";
import { User } from "@/model/User";

export interface AuthenticationRequest {
  username: string;
  password: string;
  isRememberMe?: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;

class AuthService extends BaseService {
  constructor() {
    super("");
    // Response interceptor for token refresh
    this.apiClient.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !this.isAuthEndpoint(originalRequest.url)
        ) {
          if (isRefreshing) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            const newToken = Cookies.get("access_token");
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.apiClient(originalRequest);
            }
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            const refreshToken = Cookies.get("refresh_token");
            if (refreshToken) {
              const response = await this.apiClient.post<
                IResponseMessage<AuthenticationResponse>
              >("/authenticate/refresh-token", { refreshToken });

              if (response.data.status) {
                const newToken = response.data.data.token;
                Cookies.set("access_token", newToken, {
                  secure: true,
                  sameSite: "Strict",
                  path: "/",
                });
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return this.apiClient(originalRequest);
              }
            }
            this.clearTokens();
            window.dispatchEvent(new CustomEvent("auth:logout"));
          } catch (refreshError) {
            this.clearTokens();
            window.dispatchEvent(new CustomEvent("auth:logout"));
          } finally {
            isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private storeAuthData(authData: AuthenticationResponse): void {
    Cookies.set("access_token", authData.token, {
      secure: true,
      sameSite: "Strict",
      path: "/",
    });
    Cookies.set("refresh_token", authData.refreshToken, {
      secure: true,
      sameSite: "Strict",
      path: "/",
    });
    Cookies.set("user", JSON.stringify(authData.user), {
      secure: true,
      sameSite: "Strict",
      path: "/",
    });
    Cookies.set(
      "token_expiry",
      (Date.now() + authData.expiresIn * 1000).toString(),
      {
        secure: true,
        sameSite: "Strict",
        path: "/",
      }
    );
  }

  async authenticate(
    request: AuthenticationRequest
  ): Promise<AuthServiceResponse<AuthenticationResponse>> {
    try {
      const response = await this.apiClient.post<
        IResponseMessage<AuthenticationResponse>
      >("/authenticate", request);
      if (response.data.status) {
        const authData = response.data.data;
        this.storeAuthData(authData);
        window.dispatchEvent(
          new CustomEvent("auth:login", { detail: authData.user })
        );
        return {
          success: true,
          data: authData,
          message: response.data.message || "Đăng nhập thành công",
        };
      }
      return {
        success: false,
        message: response.data.message || "Đăng nhập thất bại",
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async loginWithToken(
    refreshToken: string
  ): Promise<AuthServiceResponse<AuthenticationResponse>> {
    try {
      const request: RefreshTokenRequest = { refreshToken };
      const response = await this.apiClient.post<
        IResponseMessage<AuthenticationResponse>
      >("/authenticate/login-with-token", request);
      if (response.data.status) {
        const authData = response.data.data;
        this.storeAuthData(authData);
        window.dispatchEvent(
          new CustomEvent("auth:login", { detail: authData.user })
        );
        return {
          success: true,
          data: authData,
          message: response.data.message || "Đăng nhập với token thành công",
        };
      }
      return {
        success: false,
        message: response.data.message || "Đăng nhập với token thất bại",
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async refreshToken(
    refreshToken: string
  ): Promise<AuthServiceResponse<AuthenticationResponse>> {
    try {
      const request: RefreshTokenRequest = { refreshToken };
      const response = await this.apiClient.post<
        IResponseMessage<AuthenticationResponse>
      >("/authenticate/refresh-token", request);
      if (response.data.status) {
        const authData = response.data.data;
        this.storeAuthData(authData);
        return {
          success: true,
          data: authData,
          message: response.data.message || "Làm mới token thành công",
        };
      }
      return {
        success: false,
        message: response.data.message || "Làm mới token thất bại",
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  isAuthenticated(): boolean {
    const token = Cookies.get("access_token");
    const expiry = Cookies.get("token_expiry");
    if (!token || !expiry) return false;
    return Date.now() < parseInt(expiry);
  }

  getCurrentUser(): User | null {
    try {
      const userStr = Cookies.get("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Error parsing user from cookie:", error);
      return null;
    }
  }

  getAccessToken(): string | undefined {
    return Cookies.get("access_token");
  }

  getRefreshToken(): string | undefined {
    return Cookies.get("refresh_token");
  }

  logout(): void {
    this.clearTokens();
    window.dispatchEvent(new CustomEvent("auth:logout"));
  }

  clearTokens(): void {
    Cookies.remove("access_token", { path: "/" });
    Cookies.remove("refresh_token", { path: "/" });
    Cookies.remove("user", { path: "/" });
    Cookies.remove("token_expiry", { path: "/" });
  }

  async ensureValidToken(): Promise<boolean> {
    const token = this.getAccessToken();
    const expiry = Cookies.get("token_expiry");
    if (!token || !expiry) return false;

    const timeUntilExpiry = parseInt(expiry) - Date.now();
    if (timeUntilExpiry < 5 * 60 * 1000) {
      const refreshToken = this.getRefreshToken();
      if (refreshToken && !isRefreshing) {
        isRefreshing = true;
        try {
          const result = await this.refreshToken(refreshToken);
          return result.success;
        } finally {
          isRefreshing = false;
        }
      }
      return false;
    }
    return true;
  }

  async initializeAuth(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (refreshToken && !this.isAuthenticated()) {
      const result = await this.loginWithToken(refreshToken);
      return result.success;
    }
    return this.isAuthenticated();
  }
}

export const authService = new AuthService();
export default authService;
