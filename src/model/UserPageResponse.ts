import { UserResponse } from "./UserResponse";

export interface UserPageResponse {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  users: UserResponse[];
}
