import apiService from "@/apis/apiService";
import { UserPageResponse } from "@/model/UserPageResponse";
import { UserRequest } from "@/model/UserRequest";
import { UserUpdateRequest } from "@/model/UserUpdateRequest";
import { User } from "@/types/UserInfo";

const BASE_URL = "/users";

const userService = {
  getAllV1: (): Promise<User[]> => {
    return apiService.get<User[]>(BASE_URL);
  },

  getAllUsersWithSortBy: (
    sortBy?: string,
    pageNo: number = 1,
    pageSize: number = 10,
    search?: string
  ): Promise<UserPageResponse> => {
    const params = new URLSearchParams();
    if (sortBy) params.append("sortBy", sortBy);
    params.append("pageNo", String(pageNo - 1));
    params.append("pageSize", String(pageSize));
    if (search) params.append("search", search);
    return apiService.get<UserPageResponse>(
      `${BASE_URL}/List?${params.toString()}`
    );
  },

  getAllUsersWithSortByMultipleColumns: (
    sorts: string[],
    pageNo: number = 1,
    pageSize: number = 20
  ): Promise<UserPageResponse> => {
    return apiService.get<UserPageResponse>(`${BASE_URL}/List_sort_multiple`, {
      sort: sorts,
      pageNo,
      pageSize,
    });
  },

  // getAll: (): Promise<UserDTO[]> => {
  //   return apiService.get<UserDTO[]>(BASE_URL);
  // },

  // getById: (userId: string): Promise<UserDTO> => {
  //   return apiService.get<UserDTO>(`${BASE_URL}/${userId}`);
  // },

  create: async (payload: UserRequest): Promise<string> => {
    try {
      const res = await apiService.post<string>(`${BASE_URL}/add`, payload);
      return res;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        `Lỗi không xác định khi tạo người dùng. (Mã lỗi ${
          error.response?.status || "?"
        })`;

      throw new Error(message);
    }
  },

  // update: async (
  //   userId: string,
  //   payload: UserUpdateRequest
  // ): Promise<UserDTO> => {
  //   try {
  //     const res = await apiService.put<UserDTO>(
  //       `${BASE_URL}/upd/${userId}`,
  //       payload
  //     );
  //     return res;
  //   } catch (error: any) {
  //     const message =
  //       error.response?.data?.message ||
  //       error.response?.data?.detail ||
  //       error.message ||
  //       `Lỗi không xác định khi sửa người dùng. (Mã lỗi ${
  //         error.response?.status || "?"
  //       })`;

  //     throw new Error(message);
  //   }
  // },

  remove: (userId: string): Promise<string> => {
    return apiService.delete<string>(`${BASE_URL}/del/${userId}`);
  },

  // changePassword: (
  //   payload: UserPasswordRequest,
  //   isResetPassword: boolean
  // ): Promise<string> => {
  //   return apiService.post<string>(
  //     `${BASE_URL}/change-pwd/${isResetPassword}`,
  //     payload
  //   );
  // },
};

export default userService;
