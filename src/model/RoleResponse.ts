import { Permission } from "@/types/Permission";

export interface RoleResponse {
  id: string;
  name: string;
  permissions: Permission[];
}
