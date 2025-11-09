import { AxiosError } from "axios";
import { BaseService } from "./BaseService";
import { IResponseMessage } from "@/model/IResponseMessage";
import { UserResponse } from "@/types/UserResponse";
import { UserRequest } from "@/types/UserRequest";
import { UserUpdateRequest } from "@/types/UserUpdateRequest";
import { UserPageResponse } from "@/types/UserPageResponse";
export interface UserPasswordRequest {
  id?: string;
  password?: string;
  confirmPassword?: string;
}

export type SortDirection = "asc" | "desc";

export interface ListParams {
  pageNo?: number;
  pageSize?: number;
  sortBy?: string;
}

export interface ListMultiSortParams {
  pageNo?: number;
  pageSize?: number;
  sort?: string[];
}

class UserService extends BaseService {
  constructor() {
    super("/users");
  }

  async list(params: ListParams = {}) {
    try {
      const { pageNo = 0, pageSize = 20, sortBy } = params;
      const res = await this.apiClient.get<IResponseMessage<UserPageResponse>>(
        "/List",
        {
          params: { pageNo, pageSize, sortBy },
        }
      );
      if (res.data.status) {
        return {
          success: true as const,
          data: res.data.data,
          message: res.data.message,
        };
      }
      return {
        success: false as const,
        message: res.data.message || "Tải danh sách người dùng thất bại",
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async listMultiSort(params: ListMultiSortParams = {}) {
    try {
      const { pageNo = 0, pageSize = 20, sort = [] } = params;
      const res = await this.apiClient.get<IResponseMessage<UserPageResponse>>(
        "/List_sort_multiple",
        {
          params: { pageNo, pageSize, sort },
          paramsSerializer: (params) => {
            const qs = new URLSearchParams();
            if (params.pageNo) qs.append("pageNo", params.pageNo.toString());
            if (params.pageSize)
              qs.append("pageSize", params.pageSize.toString());
            if (params.sort) params.sort.forEach((s) => qs.append("sort", s));
            return qs.toString();
          },
        }
      );
      if (res.data.status) {
        return {
          success: true as const,
          data: res.data.data,
          message: res.data.message,
        };
      }
      return {
        success: false as const,
        message: res.data.message || "Tải danh sách người dùng thất bại",
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async getById(userId: string) {
    try {
      const res = await this.apiClient.get<IResponseMessage<UserResponse>>(
        `/${userId}`
      );
      if (res.data.status) {
        return {
          success: true as const,
          data: res.data.data,
          message: res.data.message,
        };
      }
      return {
        success: false as const,
        message: res.data.message || "Không lấy được thông tin người dùng",
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async create(req: UserRequest) {
    try {
      const res = await this.apiClient.post<IResponseMessage<string>>(
        "/add",
        req
      );
      if (res.data.status) {
        return {
          success: true as const,
          data: res.data.data,
          message: res.data.message || "Tạo người dùng thành công",
        };
      }
      return {
        success: false as const,
        message: res.data.message || "Tạo người dùng thất bại",
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async update(userId: string, req: UserUpdateRequest) {
    try {
      const res = await this.apiClient.put<IResponseMessage<UserResponse>>(
        `/upd/${userId}`,
        req
      );
      if (res.data.status) {
        return {
          success: true as const,
          data: res.data.data,
          message: res.data.message || "Cập nhật thành công",
        };
      }
      return {
        success: false as const,
        message: res.data.message || "Cập nhật thất bại",
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async deactivate(userId: string) {
    try {
      const res = await this.apiClient.delete<IResponseMessage<string>>(
        `/del/${userId}`
      );
      if (res.data.status) {
        return {
          success: true as const,
          data: res.data.data,
          message: res.data.message || "Đã vô hiệu hoá người dùng",
        };
      }
      return {
        success: false as const,
        message: res.data.message || "Vô hiệu hoá thất bại",
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async changePassword(req: UserPasswordRequest) {
    try {
      const res = await this.apiClient.patch<IResponseMessage<string>>(
        "/change-pwd",
        req
      );
      if (res.data.status) {
        return {
          success: true as const,
          data: res.data.data,
          message: res.data.message || "Đổi mật khẩu thành công",
        };
      }
      return {
        success: false as const,
        message: res.data.message || "Đổi mật khẩu thất bại",
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }
}

export const userService = new UserService();
export default userService;
