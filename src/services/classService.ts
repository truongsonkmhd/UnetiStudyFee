import apiService from "@/apis/apiService";
import { CreateClazzRequest } from "@/model/class/CreateClazzRequest";
import { ApiResponse } from "@/model/common/ApiResponse";
import { ClazzResponse } from "@/model/class/ClazzResponse";

const CLASS_BASE_ENDPOINT = "/admin/class";

const classService = {

  getAll: (): Promise<ApiResponse<ClazzResponse[]>> => {
    return apiService.get<ApiResponse<ClazzResponse[]>>(
      `${CLASS_BASE_ENDPOINT}/getAll`
    );
  },

  getAllClasses: async (): Promise<ClazzResponse[]> => {
    const res = await apiService.get<ApiResponse<ClazzResponse[]>>(
      `${CLASS_BASE_ENDPOINT}/getAll`
    );
    return res.data;
  },

  create: (payload: CreateClazzRequest): Promise<ApiResponse<ClazzResponse>> =>
    apiService.post<ApiResponse<ClazzResponse>>(
      `${CLASS_BASE_ENDPOINT}/add`,
      payload
    ),
};

export default classService;
