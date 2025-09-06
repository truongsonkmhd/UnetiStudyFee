import { AuthenticationRequest } from "@/model/AuthenticationRequest";
import { AuthenticationResponse } from "@/model/AuthenticationResponse";
import { AuthServiceResponse } from "@/model/AuthServiceResponse";
import { IResponseMessage } from "@/model/IResponseMessage";
import { RefreshTokenRequest } from "@/model/RefreshTokenRequest ";
import { User } from "@/model/User";
import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  AxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";

const AUTH_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8097/api";

const authApiClient: AxiosInstance = axios.create({
  baseURL: AUTH_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Define a type for the request config with retry flag
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// Simple in-memory lock to prevent concurrent token refreshes
let isRefreshing = false;

// Request interceptor to attach access token to non-auth endpoints
authApiClient.interceptors.request.use(
  (config) => {
    const authEndpoints = [
      "/authenticate",
      "/authenticate/refresh-token",
      "/authenticate/login-with-token",
    ];
    const isAuthEndpoint = authEndpoints.some((endpoint) =>
      config.url?.includes(endpoint)
    );

    if (!isAuthEndpoint) {
      const token = Cookies.get("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor for handling token refresh
authApiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for the ongoing refresh to complete
        await new Promise((resolve) => setTimeout(resolve, 100));
        const newToken = Cookies.get("access_token");
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return authApiClient(originalRequest);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = Cookies.get("refresh_token");
        if (refreshToken) {
          const response = await authApiClient.post<
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
            return authApiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        authService.clearTokens();
        window.dispatchEvent(new CustomEvent("auth:logout"));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export class AuthService {
  // Store authentication data in cookies
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
      { secure: true, sameSite: "Strict", path: "/" }
    );
  }

  // Login/Authenticate
  async authenticate(
    request: AuthenticationRequest
  ): Promise<AuthServiceResponse<AuthenticationResponse>> {
    try {
      const response = await authApiClient.post<
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

  // Login with refresh token
  async loginWithToken(
    refreshToken: string
  ): Promise<AuthServiceResponse<AuthenticationResponse>> {
    try {
      const request: RefreshTokenRequest = { refreshToken };
      const response = await authApiClient.post<
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

  // Refresh access token
  async refreshToken(
    refreshToken: string
  ): Promise<AuthServiceResponse<AuthenticationResponse>> {
    try {
      const request: RefreshTokenRequest = { refreshToken };
      const response = await authApiClient.post<
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

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = Cookies.get("access_token");
    const expiry = Cookies.get("token_expiry");

    if (!token || !expiry) return false;

    return Date.now() < parseInt(expiry);
  }

  // Get current user from cookies
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

  private handleError(error: AxiosError): AuthServiceResponse<any> {
    console.error("Auth API Error:", error);

    const errorData = error.response?.data as any;
    let errorMessage = "Có lỗi xảy ra, vui lòng thử lại";

    if (error.response?.status === 401) {
      errorMessage = "Tài khoản hoặc mật khẩu không đúng";
    } else if (error.response?.status === 429) {
      errorMessage = "Quá nhiều lần thử, vui lòng đợi một chút";
    } else if (error.response?.status >= 500) {
      errorMessage = "Lỗi máy chủ, vui lòng thử lại sau";
    } else if (
      error.code === "ECONNABORTED" ||
      error.message.includes("timeout")
    ) {
      errorMessage = "Kết nối bị gián đoạn, vui lòng thử lại";
    } else if (errorData?.message) {
      errorMessage = errorData.message;
    }

    return {
      success: false,
      message: errorMessage,
      errors: errorData?.errors,
      status: error.response?.status,
    };
  }
}

// Export singleton
export const authService = new AuthService();
