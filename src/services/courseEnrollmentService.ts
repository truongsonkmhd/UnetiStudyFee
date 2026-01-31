import apiService from "@/apis/apiService";
import { PageResponse } from "@/model/common/PageResponse";
import { EnrollmentResponse } from "@/model/enrollment/EnrollmentResponse";
import { EnrollmentApprovalRequest } from "@/model/enrollment/EnrollmentApprovalRequest";

const ENROLLMENT_BASE_ENDPOINT = "/enrollments";

const courseEnrollmentService = {
    requestEnrollment: (courseId: string, message?: string): Promise<EnrollmentResponse> => {
        return apiService.post<EnrollmentResponse>(`${ENROLLMENT_BASE_ENDPOINT}/request/${courseId}`, message || "");
    },

    approveEnrollment: (enrollmentId: string): Promise<EnrollmentResponse> => {
        return apiService.post<EnrollmentResponse>(`${ENROLLMENT_BASE_ENDPOINT}/approve/${enrollmentId}`, {});
    },

    rejectEnrollment: (enrollmentId: string, reason?: string): Promise<EnrollmentResponse> => {
        const request: EnrollmentApprovalRequest = { reason };
        return apiService.post<EnrollmentResponse>(`${ENROLLMENT_BASE_ENDPOINT}/reject/${enrollmentId}`, request);
    },

    getCourseEnrollments: (
        courseId: string,
        params?: {
            status?: 'PENDING' | 'APPROVED' | 'REJECTED';
            page?: number;
            size?: number;
            q?: string;
        }
    ): Promise<PageResponse<EnrollmentResponse>> => {
        const queryParams = new URLSearchParams();
        if (params) {
            if (params.status) queryParams.append('status', params.status);
            if (params.page !== undefined) queryParams.append('page', params.page.toString());
            if (params.size !== undefined) queryParams.append('size', params.size.toString());
            if (params.q) queryParams.append('q', params.q);
        }
        return apiService.get<PageResponse<EnrollmentResponse>>(`${ENROLLMENT_BASE_ENDPOINT}/course/${courseId}?${queryParams.toString()}`);
    },

    getMyEnrollments: (
        status?: 'PENDING' | 'APPROVED' | 'REJECTED',
        page: number = 0,
        size: number = 10
    ): Promise<PageResponse<EnrollmentResponse>> => {
        return apiService.get<PageResponse<EnrollmentResponse>>(`${ENROLLMENT_BASE_ENDPOINT}/my-enrollments`, {
            status,
            page,
            size
        });
    },

    isEnrolled: (courseId: string): Promise<boolean> => {
        return apiService.get<boolean>(`${ENROLLMENT_BASE_ENDPOINT}/check/${courseId}`);
    },

    getEnrollmentStatus: (courseId: string): Promise<EnrollmentResponse | null> => {
        return apiService.get<EnrollmentResponse | null>(`${ENROLLMENT_BASE_ENDPOINT}/status/${courseId}`);
    }
};

export default courseEnrollmentService;
