import apiService from "@/apis/apiService";
import { Permission, PermissionRequest } from "@/types/Permission";
const PERMISSION_BASE_ENDPOINT = "/permissions";

const permissionService = { 
    getAll: (): Promise<Permission[]> =>
        apiService.get<Permission[]>(`${PERMISSION_BASE_ENDPOINT}`),

    /**
     * Create a new permission
     */
    create: (data: PermissionRequest): Promise<Permission> =>
        apiService.post<Permission>(`${PERMISSION_BASE_ENDPOINT}/create`, data),

    /**
     * Update permission
     */
    update: (id: number, data: PermissionRequest): Promise<Permission> =>
        apiService.put<Permission>(`${PERMISSION_BASE_ENDPOINT}/update/${id}`, data),

    /**
     * Delete permission
     */
    delete: (id: number): Promise<number> =>
        apiService.delete<number>(`${PERMISSION_BASE_ENDPOINT}/${id}`),
};

export default permissionService;   