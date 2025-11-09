import { Permission } from "./Permission";

export interface RoleResponse {
  id: string;
  name: string;
  permissions: Permission[];
}
