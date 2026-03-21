import apiService from "@/apis/apiService";
import { User , UserPageResponse} from "@/types/User";

const USER_BASE_ENDPOINT = "/users";

const userService = {
    getUsers: (page:number, size: number): Promise<UserPageResponse> =>
        apiService.get<UserPageResponse>(`${USER_BASE_ENDPOINT}/List?pageNo=${page}&pageSize=${size}`),

    searchUsers: (
    keyword: string,
    page: number,
    size: number
  ): Promise<UserPageResponse> =>
    apiService.get<UserPageResponse>(
      `${USER_BASE_ENDPOINT}/search?keyword=${keyword}&page=${page}&size=${size}`
    ),

  /**
   * Create user
   */
  create: (data: any): Promise<User> => {
    if (data.studentCode) {
      return apiService.post<User>(`${USER_BASE_ENDPOINT}/add-student`, data);
    }
    if (data.teacherID) {
      return apiService.post<User>(`${USER_BASE_ENDPOINT}/add-teacher`, data);
    }
    return apiService.post<User>(`${USER_BASE_ENDPOINT}/add`, data);
  },

  /**
   * Update user
   */
  update: (id: string, data: any): Promise<User> =>
    apiService.put<User>(`${USER_BASE_ENDPOINT}/upd/${id}`, data),

  /**
   * Delete user
   */
  delete: (id: string): Promise<string> =>
    apiService.delete<string>(`${USER_BASE_ENDPOINT}/del/${id}`),

  promotetoTeacher: (id: string, data: any): Promise<User> => 
    apiService.post<User>(`${USER_BASE_ENDPOINT}/promote-teacher/${id}`, data)
  
}

export default userService;