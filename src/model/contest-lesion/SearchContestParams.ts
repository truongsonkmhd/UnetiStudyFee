import { StatusContest } from "@/types/enum/StatusContest";

export interface SearchContestParams {
  page?: number;
  size?: number;
  q?: string;
  statusContest?: StatusContest;
}
