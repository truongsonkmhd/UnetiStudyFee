import axiosClient from "@/apis/axiosClient";
import { ContestSessionResponse, ContestSubmissionRequest, ContestSubmissionResult } from "@/types/contest";

const BASE_URL = "/student/class-contests";

export const studentClassContestService = {
  startContest: (classContestId: string): Promise<ContestSessionResponse> =>
    axiosClient.post(`${BASE_URL}/${classContestId}/start`),

  getSession: (classContestId: string): Promise<ContestSessionResponse> =>
    axiosClient.get(`${BASE_URL}/${classContestId}/session`),

  submitContest: (submissionId: string, payload: ContestSubmissionRequest): Promise<ContestSubmissionResult> =>
    axiosClient.post(`${BASE_URL}/submissions/${submissionId}/submit`, payload),
};

