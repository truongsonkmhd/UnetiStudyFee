// src/apis/apiService.ts

import axios, {
  type AxiosResponse,
  type AxiosError,
  type InternalAxiosRequestConfig,
  AxiosInstance,
  AxiosRequestConfig,
} from "axios";
import queryString from "query-string";
import { LoginData } from "@/types/auth";
import { toast } from "sonner";

const baseUrlRaw = import.meta.env.VITE_API_URL || "http://localhost:8083/api";
const refreshEndpointRaw = import.meta.env.VITE_REFRESH_TOKEN_ENDPOINT || "/authenticate/refresh-token";

const baseUrl = baseUrlRaw.replace(/\/+$/, "");
const refreshPath = refreshEndpointRaw.startsWith("/")
  ? refreshEndpointRaw.slice(1)
  : refreshEndpointRaw;
const urlRefreshToken = `${baseUrl}/${refreshPath}`;

const axiosClientDowload = axios.create({
  baseURL: baseUrl,
  paramsSerializer: {
    encode: (params) => queryString.stringify(params),
  },
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

axiosClientDowload.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("access_token") 
    || sessionStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axiosClientDowload.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.config.responseType === 'blob' ||
      (response.headers['content-type'] &&
        response.headers['content-type'].includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'))) {
      return response; 
    }
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
    if (!originalRequest) return Promise.reject(error);

    if (originalRequest.url?.includes(urlRefreshToken)) {
      return Promise.reject(error);
    }

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(axiosClientDowload(originalRequest));
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

          return axiosClientDowload(originalRequest);
        }

        return Promise.reject(new Error("Refresh token response invalid"));
      } catch (refreshError) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        window.location.href = "/auth";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

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
  postDowload<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<R>;
}

const customAxiosInstance = axiosClientDowload as CustomAxiosInstance;

customAxiosInstance.postDowload = <T = any, R = AxiosResponse<T>, D = any>(
  url: string,
  data?: D,
  config: AxiosRequestConfig<D> = {}
): Promise<R> => {
  return axiosClientDowload.post<T, R>(url, data, {
    ...config,
    responseType: 'blob',
  });
};

export default customAxiosInstance;