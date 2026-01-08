import { LoginData } from "@/types/Auth";
import axios, {
  type AxiosResponse,
  type AxiosError,
  type InternalAxiosRequestConfig,
  AxiosInstance,
  AxiosRequestConfig,
} from "axios";
import queryString from "query-string";
import { toast } from "sonner";

const baseUrlRaw = import.meta.env.VITE_API_URL || "http://localhost:8083/api";
const refreshEndpointRaw =
  import.meta.env.VITE_REFRESH_TOKEN_ENDPOINT || "/authenticate/refresh-token";

// build URL safely (avoid double slashes)
const baseUrl = baseUrlRaw.replace(/\/+$/, "");
const refreshPath = refreshEndpointRaw.startsWith("/")
  ? refreshEndpointRaw.slice(1)
  : refreshEndpointRaw;
const urlRefreshToken = `${baseUrl}/${refreshPath}`;

const axiosClient = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: {
    encode: (params) => queryString.stringify(params),
  },
});

// === Helper để refresh token ===
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// === Request interceptor ===
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => {
    const apiResponse = response.data;
    if (apiResponse && apiResponse.status === true) {
      return apiResponse.data;
    }
    return Promise.reject({
      message: apiResponse?.message ?? "Unknown API response",
      statusCode: apiResponse?.statusCode,
    });
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    if (!originalRequest) {
      console.error("Axios error without original request config");
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes(urlRefreshToken)) {
      console.error("Refresh token request itself failed. Aborting.");
      return Promise.reject(error);
    }

    console.log("error.response", error);

    if (error.response?.status === 403 && !originalRequest._retry) {
      // Logic refresh token (giữ nguyên như hiện tại)
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(axiosClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const res = await axios.post<LoginData>(
          `${baseUrlRaw}${refreshEndpointRaw}`,
          { refreshToken }
        );

        const data = res.data.data;

        if (data && data.token) {
          const storage = localStorage;
          storage.setItem("access_token", data.token);
          storage.setItem("refresh_token", data.refreshToken);
          storage.setItem("user", JSON.stringify(data.user));

          const newAccessToken = data.token;

          onRefreshed(newAccessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          return axiosClient(originalRequest);
        }

        return Promise.reject(new Error("Refresh token response invalid"));
      } catch (refreshError) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        // chuyển hướng login
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        setTimeout(() => (window.location.href = "/auth"), 500);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Thêm xử lý lỗi 400
    if (error.response?.status === 400) {
      const errorMessage =
        (error.response.data as any)?.message ||
        "Yêu cầu không hợp lệ. Vui lòng kiểm tra dữ liệu.";
      toast.error(errorMessage);
      return Promise.reject({
        message: errorMessage,
        statusCode: error.response.status,
      });
    }

    if (error.response?.status === 409) {
      const errorMessage =
        (error.response.data as any)?.message ||
        "Xung đột dữ liệu. Vui lòng kiểm tra lại.";
      toast.error(errorMessage);
      return Promise.reject({
        message: errorMessage,
        statusCode: error.response.status,
      });
    }

    // Xử lý các lỗi khác (ví dụ: 500, 404, v.v.)
    return Promise.reject({
      message:
        (error.response?.data as any)?.message ||
        error.message ||
        "Unknown error",
      statusCode: error.response?.status,
    });
  }
);

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

interface CustomAxiosInstance extends AxiosInstance {
  get<T = any, R = T, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<R>;
  post<T = any, R = T, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R>;
  put<T = any, R = T, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R>;
  delete<T = any, R = T, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<R>;
}

export default axiosClient as CustomAxiosInstance;
