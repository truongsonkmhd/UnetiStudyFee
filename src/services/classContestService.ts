import apiService from "@/apis/apiService";
import { ClassContestResponse } from "@/model/class-contest/ClassContestResponse";
import { CreateClassContestRequest } from "@/model/class-contest/CreateClassContestRequest";
import { RescheduleContestRequest } from "@/model/class-contest/RescheduleContestRequest";
import { UpdateClassRequest } from "@/model/class-contest/UpdateClassRequest";
import { ClassSummary } from "@/types/ClassSummary";
import { ClasssContest } from "@/types/ClassContest";


const CLASS_BASE_ENDPOINT = "/admin/class-contests";

const classContestService = {
  getAll: (params?: {
    instructorId?: string;
    isActive?: boolean;
    page?: number;
    size?: number;
  }): Promise<ClassSummary[]> => {
    const queryParams = new URLSearchParams();
    if (params?.instructorId) queryParams.append("instructorId", params.instructorId);
    if (params?.isActive !== undefined) queryParams.append("isActive", String(params.isActive));
    if (params?.page !== undefined) queryParams.append("page", String(params.page));
    if (params?.size !== undefined) queryParams.append("size", String(params.size));
    
    return apiService.get<ClassSummary[]>(
      `${CLASS_BASE_ENDPOINT}${queryParams.toString() ? `?${queryParams}` : ""}`
    );
  },

  getById: (classId: string): Promise<ClasssContest> =>
    apiService.get<ClasssContest>(`${CLASS_BASE_ENDPOINT}/${classId}`),

  create: (payload: CreateClassContestRequest): Promise<ClasssContest> =>
    apiService.post<ClasssContest>(CLASS_BASE_ENDPOINT, payload),

  update: (classId: string, payload: UpdateClassRequest): Promise<ClasssContest> =>
    apiService.put<ClasssContest>(`${CLASS_BASE_ENDPOINT}/${classId}`, payload),

  delete: (classId: string): Promise<void> =>
    apiService.delete<void>(`${CLASS_BASE_ENDPOINT}/${classId}`),

  activate: (classId: string): Promise<ClasssContest> =>
    apiService.post<ClasssContest>(`${CLASS_BASE_ENDPOINT}/${classId}/activate`),

  deactivate: (classId: string): Promise<ClasssContest> =>
    apiService.post<ClasssContest>(`${CLASS_BASE_ENDPOINT}/${classId}/deactivate`),

  // ===== Class Contest Management =====
  getClassContests: (classId: string): Promise<ClassContestResponse[]> =>
    apiService.get<ClassContestResponse[]>(
      `${CLASS_BASE_ENDPOINT}/${classId}/contests`
    ),

  getOngoingContests: (classId: string): Promise<ClassContestResponse[]> =>
    apiService.get<ClassContestResponse[]>(
      `${CLASS_BASE_ENDPOINT}/${classId}/contests/ongoing`
    ),

  getUpcomingContests: (classId: string): Promise<ClassContestResponse[]> =>
    apiService.get<ClassContestResponse[]>(
      `${CLASS_BASE_ENDPOINT}/${classId}/contests/upcoming`
    ),

  addContest: (payload: CreateClassContestRequest): Promise<ClassContestResponse> =>
    apiService.post<ClassContestResponse>(
      `${CLASS_BASE_ENDPOINT}/contests`,
      payload
    ),

  updateContestStatuses: (classId: string): Promise<boolean> =>
    apiService.post<boolean>(
      `${CLASS_BASE_ENDPOINT}/${classId}/contests/update-statuses`
    ),

  cancelContest: (classContestId: string): Promise<ClassContestResponse> =>
    apiService.post<ClassContestResponse>(
      `${CLASS_BASE_ENDPOINT}/contests/${classContestId}/cancel`
    ),

  rescheduleContest: (
    classContestId: string,
    payload: RescheduleContestRequest
  ): Promise<ClassContestResponse> =>
    apiService.put<ClassContestResponse>(
      `${CLASS_BASE_ENDPOINT}/contests/${classContestId}/reschedule`,
      payload
    ),

  // ===== Statistics & Analytics =====
  getClassStatistics: (classId: string): Promise<any> =>
    apiService.get<any>(`${CLASS_BASE_ENDPOINT}/${classId}/statistics`),

  getContestParticipation: (classContestId: string): Promise<any> =>
    apiService.get<any>(
      `${CLASS_BASE_ENDPOINT}/contests/${classContestId}/participation`
    ),
};

export default classContestService;