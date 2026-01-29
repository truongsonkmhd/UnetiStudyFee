import apiService from "@/apis/apiService";
import { PageResponse } from "@/model/common/PageResponse";
import { ContestLessonRequest } from "@/model/contest-lesion/ContestLessonRequest";
import { ContestLessonSummary } from "@/model/contest-lesion/ContestLessonSummary";
import { SearchContestParams } from "@/model/contest-lesion/SearchContestParams";
import { ContestLesson } from "@/types/enum/ContestLesson";
import { StatusContest } from "@/types/enum/StatusContest";

const CONTEST_BASE_ENDPOINT = "/admin/contest-lesson";

const contestLessonService = {
  // ===== Contest Template CRUD =====
  create: (payload: ContestLessonRequest): Promise<ContestLesson> =>
    apiService.post<ContestLesson>(`${CONTEST_BASE_ENDPOINT}/add`, payload),

  getById: (contestLessonId: string): Promise<ContestLesson> =>
    apiService.get<ContestLesson>(`${CONTEST_BASE_ENDPOINT}/${contestLessonId}`),

  search: (params: SearchContestParams): Promise<PageResponse<ContestLessonSummary>> => {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.append("page", String(params.page));
    if (params.size !== undefined) queryParams.append("size", String(params.size));
    if (params.q) queryParams.append("q", params.q);
    if (params.statusContest) queryParams.append("statusContest", params.statusContest);
    
    return apiService.get<PageResponse<ContestLessonSummary>>(
      `${CONTEST_BASE_ENDPOINT}/search?${queryParams}`
    );
  },

  update: (contestLessonId: string, payload: Partial<ContestLessonRequest>): Promise<ContestLesson> =>
    apiService.put<ContestLesson>(`${CONTEST_BASE_ENDPOINT}/${contestLessonId}`, payload),

  delete: (contestLessonId: string): Promise<void> =>
    apiService.delete<void>(`${CONTEST_BASE_ENDPOINT}/${contestLessonId}`),

  // ===== Status Management =====
  updateStatus: (contestLessonId: string, status: StatusContest): Promise<ContestLesson> =>
    apiService.put<ContestLesson>(
      `${CONTEST_BASE_ENDPOINT}/${contestLessonId}/status`,
      { status }
    ),

  publish: (contestLessonId: string): Promise<ContestLesson> =>
    apiService.post<ContestLesson>(`${CONTEST_BASE_ENDPOINT}/${contestLessonId}/publish`),

  archive: (contestLessonId: string): Promise<ContestLesson> =>
    apiService.post<ContestLesson>(`${CONTEST_BASE_ENDPOINT}/${contestLessonId}/archive`),

  // ===== Contest Content =====
  addCodingExercises: (contestLessonId: string, exerciseTemplateIds: string[]): Promise<ContestLesson> =>
    apiService.post<ContestLesson>(
      `${CONTEST_BASE_ENDPOINT}/${contestLessonId}/exercises`,
      { exerciseTemplateIds }
    ),

  removeCodingExercise: (contestLessonId: string, exerciseId: string): Promise<ContestLesson> =>
    apiService.delete<ContestLesson>(
      `${CONTEST_BASE_ENDPOINT}/${contestLessonId}/exercises/${exerciseId}`
    ),

  // ===== Analytics =====
  getUsageStatistics: (contestLessonId: string): Promise<any> =>
    apiService.get<any>(`${CONTEST_BASE_ENDPOINT}/${contestLessonId}/statistics`),

  getReadyContests: (): Promise<ContestLessonSummary[]> =>
    apiService.get<ContestLessonSummary[]>(`${CONTEST_BASE_ENDPOINT}/ready`),
};

export default contestLessonService;