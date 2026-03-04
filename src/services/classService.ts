import apiService from "@/apis/apiService";
import { CreateClazzRequest } from "@/model/class/CreateClazzRequest";
import { ApiResponse } from "@/model/common/ApiResponse";
import { ClazzResponse } from "@/model/class/ClazzResponse";

const CLASS_BASE_ENDPOINT = "/admin/class";

const classService = {

  getAll: (): Promise<ClazzResponse[]> => {
    return apiService.get<ClazzResponse[]>(
      `${CLASS_BASE_ENDPOINT}/getAll`
    );
  },

  getAllClasses: async (): Promise<ClazzResponse[]> => {
    const res = await apiService.get<ClazzResponse[]>(
      `${CLASS_BASE_ENDPOINT}/getAll`
    );
    return res || [];
  },

  create: (payload: CreateClazzRequest): Promise<ClazzResponse> =>
    apiService.post<ClazzResponse>(
      `${CLASS_BASE_ENDPOINT}/add`,
      payload
    ),

  regenerateInviteCode: (classId: string): Promise<ClazzResponse> =>
    apiService.post<ClazzResponse>(
      `${CLASS_BASE_ENDPOINT}/${classId}/regenerate-invite-code`,
      {}
    ),

  joinClass: (inviteCode: string, studentId: string): Promise<string> =>
    apiService.post<string>(
      `${CLASS_BASE_ENDPOINT}/join?inviteCode=${inviteCode}&studentId=${studentId}`,
      {}
    ),

  getByInviteCode: (inviteCode: string): Promise<ClazzResponse> =>
    apiService.get<ClazzResponse>(
      `${CLASS_BASE_ENDPOINT}/get-by-invite-code?inviteCode=${inviteCode}`
    ),

  getMyClasses: (studentId: string): Promise<ClazzResponse[]> =>
    apiService.get<ClazzResponse[]>(
      `${CLASS_BASE_ENDPOINT}/my-classes?studentId=${studentId}`
    ),
};

export default classService;
