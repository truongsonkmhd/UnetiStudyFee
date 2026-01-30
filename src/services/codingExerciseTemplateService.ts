import apiService from "@/apis/apiService";
import { CodingExerciseTemplate } from "@/model/coding-template/CodingExerciseTemplate";
import { ApiResponse } from "@/model/common/ApiResponse";
import { TemplateCard } from "@/model/coding-template/TemplateCard";
import { SearchFilters } from "@/model/coding-template/SearchFilters";
import { CursorResponse } from "@/model/common/CursorResponse";
import { Difficulty } from "@/model/coding-template/Difficulty";
import { PageResponse } from "@/model/common/PageResponse";


const CODING_EXERCISE_TEMPLATE_ENDPOINT = "/admin/coding-exercise-template";

const codingExerciseTemplateService = {
  // ===== CRUD =====

  getById: (id: string): Promise<CodingExerciseTemplate> =>
    apiService.get<CodingExerciseTemplate>(
      `${CODING_EXERCISE_TEMPLATE_ENDPOINT}/${id}`
    ),

  create: (
    payload: CodingExerciseTemplate
  ): Promise<CodingExerciseTemplate> =>
    apiService.post<CodingExerciseTemplate>(
      `${CODING_EXERCISE_TEMPLATE_ENDPOINT}`,
      payload
    ),

  // ===== OFFSET PAGINATION =====
  getPublishedTemplates: (
    page = 0,
    size = 20
  ): Promise<PageResponse<TemplateCard>> => {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });

    return apiService.get<PageResponse<TemplateCard>>(
      `${CODING_EXERCISE_TEMPLATE_ENDPOINT}?${params}`
    );
  },

  searchTemplates: (
    params: SearchFilters & { page?: number; size?: number }
  ): Promise<ApiResponse<PageResponse<TemplateCard>>> => {
    const queryParams = new URLSearchParams();

    if (params.page !== undefined) queryParams.append("page", String(params.page));
    if (params.size !== undefined) queryParams.append("size", String(params.size));
    if (params.q) queryParams.append("q", params.q);
    if (params.difficulty) queryParams.append("difficulty", params.difficulty);
    if (params.category) queryParams.append("category", params.category);
    if (params.language) queryParams.append("language", params.language);

    return apiService.get<ApiResponse<PageResponse<TemplateCard>>>(
      `${CODING_EXERCISE_TEMPLATE_ENDPOINT}/search?${queryParams}`
    );
  },

  searchAllTemplates: (
    params: SearchFilters & { page?: number; size?: number }
  ): Promise<PageResponse<TemplateCard>> => {
    const queryParams = new URLSearchParams();

    if (params.page !== undefined) queryParams.append("page", String(params.page));
    if (params.size !== undefined) queryParams.append("size", String(params.size));
    if (params.q) queryParams.append("q", params.q);
    if (params.difficulty) queryParams.append("difficulty", params.difficulty);
    if (params.category) queryParams.append("category", params.category);
    if (params.language) queryParams.append("language", params.language);
    if (params.published !== undefined)
      queryParams.append("published", String(params.published));

    return apiService.get<PageResponse<TemplateCard>>(
      `${CODING_EXERCISE_TEMPLATE_ENDPOINT}/search/all?${queryParams}`
    );
  },

  // ===== CURSOR PAGINATION =====
  getPublishedTemplatesCursor: (
    cursor?: string,
    size = 10
  ): Promise<CursorResponse<TemplateCard>> => {
    const queryParams = new URLSearchParams({ size: String(size) });
    if (cursor) queryParams.append("cursor", cursor);

    return apiService.get<CursorResponse<TemplateCard>>(
      `${CODING_EXERCISE_TEMPLATE_ENDPOINT}/cursor?${queryParams}`
    );
  },

  searchTemplatesCursor: (
    params: SearchFilters & { cursor?: string; size?: number }
  ): Promise<CursorResponse<TemplateCard>> => {
    const queryParams = new URLSearchParams();

    if (params.size !== undefined) queryParams.append("size", String(params.size));
    if (params.cursor) queryParams.append("cursor", params.cursor);
    if (params.q) queryParams.append("q", params.q);
    if (params.difficulty) queryParams.append("difficulty", params.difficulty);
    if (params.category) queryParams.append("category", params.category);
    if (params.language) queryParams.append("language", params.language);

    return apiService.get<CursorResponse<TemplateCard>>(
      `${CODING_EXERCISE_TEMPLATE_ENDPOINT}/cursor/search?${queryParams}`
    );
  },

  // ===== UTILITIES =====
  getDifficultyColor: (difficulty: Difficulty): string => {
    const colors: Record<Difficulty, string> = {
      [Difficulty.EASY]: "success",
      [Difficulty.MEDIUM]: "warning",
      [Difficulty.HARD]: "danger",
      [Difficulty.EXPERT]: "dark",
    };
    return colors[difficulty] ?? "secondary";
  },

  getDifficultyLabel: (difficulty: Difficulty): string =>
    difficulty.charAt(0) + difficulty.slice(1).toLowerCase(),

  generateSlug: (text: string): string =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, ""),
};

export default codingExerciseTemplateService;
