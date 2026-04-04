import axiosClient from "@/apis/axiosClient";
import { ContestSessionResponse, ContestSubmissionRequest, ContestSubmissionResult } from "@/types/contest";

const STUDENT_CLASS_BASE_URL = "/student/class-contests";

export const studentClassContestService = {
  startContest: (classContestId: string): Promise<ContestSessionResponse> =>
    axiosClient.post(`${STUDENT_CLASS_BASE_URL}/${classContestId}/start`),

  getSession: (classContestId: string): Promise<ContestSessionResponse> =>
    axiosClient.get(`${STUDENT_CLASS_BASE_URL}/${classContestId}/session`),

  submitContest: (submissionId: string, payload: ContestSubmissionRequest): Promise<ContestSubmissionResult> =>
    axiosClient.post(`${STUDENT_CLASS_BASE_URL}/submissions/${submissionId}/submit`, payload),
};

