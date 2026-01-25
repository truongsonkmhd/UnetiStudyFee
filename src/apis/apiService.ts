import axiosClient from "./axiosClient";
import axiosClientDowload from "./axiosClientDowload";
import axios, { type AxiosRequestConfig } from "axios";
// Định nghĩa một object chứa tất cả các phương thức gọi API
const apiService = {
  /**
   * Phương thức GET chung
   * @param url - Đường dẫn tương đối của endpoint
   * @param params - Các query parameters (tùy chọn)
   * @returns Promise<T> - Dữ liệu đã được bóc tách từ response
   */
  get<T>(url: string, params?: object): Promise<T> {
    const config: AxiosRequestConfig = { params };
    return axiosClient.get<T>(url, config);
  },

  /**
   * Phương thức POST chung
   * @param url - Đường dẫn tương đối của endpoint
   * @param body - Dữ liệu cần gửi trong body (tùy chọn)
   * @returns Promise<T> - Dữ liệu đã được bóc tách từ response
   */
  post<T>(url: string, body?: object): Promise<T> {
    return axiosClient.post<T>(url, body);
  },

  /**
   * Phương thức PUT chung
   * @param url - Đường dẫn tương đối của endpoint
   * @param body - Dữ liệu cần gửi trong body (tùy chọn)
   * @returns Promise<T> - Dữ liệu đã được bóc tách từ response
   */
  put<T>(url: string, body?: object): Promise<T> {
    return axiosClient.put<T>(url, body);
  },

    /**
   * Phương thức PATCH chung
   * @param url - Đường dẫn tương đối của endpoint
   * @param body - Dữ liệu cần gửi trong body (tùy chọn)
   * @returns Promise<T> - Dữ liệu đã được bóc tách từ response
   */
  patch<T>(url: string, body?: object): Promise<T> {
    return axiosClient.patch<T>(url, body);
  },


  /**
   * Phương thức DELETE chung
   * @param url - Đường dẫn tương đối của endpoint
   * @returns Promise<T> - Dữ liệu đã được bóc tách từ response
   */
  delete<T>(url: string): Promise<T> {
    return axiosClient.delete<T>(url);
  },

  postDowload<T>(url: string, body?: object): Promise<any> {
    return axiosClientDowload.postDowload<T>(url, body);
  },
};

export default apiService;
