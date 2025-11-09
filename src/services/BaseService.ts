import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { IResponseMessage } from "@/model/IResponseMessage";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8097/api";

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  errors?: any;
  status?: number;
}

export abstract class BaseService {
  protected apiClient: AxiosInstance;

  constructor(basePath: string) {
    this.apiClient = axios.create({
      baseURL: `${API_BASE_URL}${basePath}`,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // Request interceptor to attach access token
    this.apiClient.interceptors.request.use(
      (config) => {
        const token = Cookies.get("access_token");
        if (token && !this.isAuthEndpoint(config.url)) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );
  }

  // Check if the request is to an authentication endpoint
  protected isAuthEndpoint(url?: string): boolean {
    const authEndpoints = [
      "/authenticate",
      "/authenticate/refresh-token",
      "/authenticate/login-with-token",
    ];
    return url
      ? authEndpoints.some((endpoint) => url.includes(endpoint))
      : false;
  }

  // Unified error handling
  protected handleError(error: AxiosError): ServiceResponse<any> {
    console.error("API Error:", error);

    const errorData = error.response?.data as any;
    let errorMessage = "Có lỗi xảy ra, vui lòng thử lại";

    if (error.response?.status === 401) {
      errorMessage = "Không có quyền hoặc phiên đăng nhập đã hết hạn";
    } else if (error.response?.status === 403) {
      errorMessage = "Bạn không được phép thực hiện hành động này";
    } else if (error.response?.status === 429) {
      errorMessage = "Quá nhiều yêu cầu, vui lòng thử lại sau";
    } else if (error.response?.status && error.response.status >= 500) {
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
