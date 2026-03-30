import apiService from "@/apis/apiService";
import { CreateClazzRequest } from "@/model/class/CreateClazzRequest";
import { UserResponse } from "@/model/UserResponse";
import { ClazzResponse } from "@/model/class/ClazzResponse";

const ADMIN_BASE_ENDPOINT = "/admin/class";
const STUDENT_BASE_ENDPOINT = "/student/class";

const classService = {
  // Admin Methods
  admin: {
    getAll: (): Promise<ClazzResponse[]> => {
      return apiService.get<ClazzResponse[]>(
        `${ADMIN_BASE_ENDPOINT}/getAll`
      );
    },

    create: (payload: CreateClazzRequest): Promise<ClazzResponse> =>
      apiService.post<ClazzResponse>(
        `${ADMIN_BASE_ENDPOINT}/add`,
        payload
      ),

    regenerateInviteCode: (classId: string): Promise<ClazzResponse> =>
      apiService.post<ClazzResponse>(
        `${ADMIN_BASE_ENDPOINT}/${classId}/regenerate-invite-code`,
        {}
      ),

    getStudentsInClass: (classId: string): Promise<UserResponse[]> =>
      apiService.get<UserResponse[]>(
        `${ADMIN_BASE_ENDPOINT}/${classId}/students`
      ),
    addCoursesToClass: (classId: string, courseIds: string[]): Promise<any[]> =>
      apiService.post<any[]>(
        `${ADMIN_BASE_ENDPOINT}/${classId}/courses`,
        { courseIds }
      ),

    getCoursesInClass: (classId: string): Promise<any[]> =>
      apiService.get<any[]>(
        `${ADMIN_BASE_ENDPOINT}/${classId}/courses`
      ),

    update: (classId: string, payload: any): Promise<ClazzResponse> =>
      apiService.put<ClazzResponse>(
        `${ADMIN_BASE_ENDPOINT}/update/${classId}`,
        payload
      ),

    delete: (classId: string): Promise<string> =>
      apiService.delete<string>(
        `${ADMIN_BASE_ENDPOINT}/delete/${classId}`
      ),
  },

  student: {
    joinClass: (inviteCode: string, studentId: string): Promise<string> =>
      apiService.post<string>(
        `${STUDENT_BASE_ENDPOINT}/join?inviteCode=${inviteCode}&studentId=${studentId}`,
        {}
      ),

    getByInviteCode: (inviteCode: string): Promise<ClazzResponse> =>
      apiService.get<ClazzResponse>(
        `${STUDENT_BASE_ENDPOINT}/get-by-invite-code?inviteCode=${inviteCode}`
      ),

    getMyClasses: (studentId: string): Promise<ClazzResponse[]> =>
      apiService.get<ClazzResponse[]>(
        `${STUDENT_BASE_ENDPOINT}/my-classes?studentId=${studentId}`
      ),

    getById: (classId: string): Promise<ClazzResponse> =>
      apiService.get<ClazzResponse>(
        `${STUDENT_BASE_ENDPOINT}/${classId}`
      ),

    getCoursesInClass: (classId: string): Promise<any[]> =>
      apiService.get<any[]>(
        `${STUDENT_BASE_ENDPOINT}/${classId}/courses`
      ),
  },

  getAll: (): Promise<ClazzResponse[]> => {
    return apiService.get<ClazzResponse[]>(`${ADMIN_BASE_ENDPOINT}/getAll`);
  },

  getMyClasses: (studentId: string): Promise<ClazzResponse[]> =>
    apiService.get<ClazzResponse[]>(`${STUDENT_BASE_ENDPOINT}/my-classes?studentId=${studentId}`),
};

export default classService;
