import apiService from "@/apis/apiService";
import { PageResponse } from "@/model/common/PageResponse";
import { CursorResponse } from "@/model/common/CursorResponse";
import { CourseCardResponse } from "@/model/course-admin/CourseCardResponse";
import { CourseQuickSearchResponse } from "@/model/course-admin/CourseQuickSearchResponse";
import { GlobalQuickSearchResponse } from "@/model/search/GlobalQuickSearchResponse";

const CATALOG_BASE_ENDPOINT = "/course-catalog";

const courseCatalogService = {
    getPublishedCourses: (
        page: number = 0,
        size: number = 12,
        q?: string,
        category?: string
    ): Promise<PageResponse<CourseCardResponse>> => {
        const queryParams = new URLSearchParams();
        queryParams.append("page", String(page));
        queryParams.append("size", String(size));
        if (q) queryParams.append("q", q);
        if (category) queryParams.append("category", category);

        return apiService.get<PageResponse<CourseCardResponse>>(
            `${CATALOG_BASE_ENDPOINT}/published?${queryParams.toString()}`
        );
    },

    getPublishedCoursesScroll: (
        cursor?: string,
        size: number = 12,
        q?: string,
        category?: string
    ): Promise<CursorResponse<CourseCardResponse>> => {
        const queryParams = new URLSearchParams();
        queryParams.append("size", String(size));
        if (cursor) queryParams.append("cursor", cursor);
        if (q) queryParams.append("q", q);
        if (category) queryParams.append("category", category);

        return apiService.get<CursorResponse<CourseCardResponse>>(
            `${CATALOG_BASE_ENDPOINT}/published/scroll?${queryParams.toString()}`
        );
    },

    instantSearch: (q: string, limit: number = 5): Promise<CourseQuickSearchResponse[]> => {
        return apiService.get<CourseQuickSearchResponse[]>(
            `${CATALOG_BASE_ENDPOINT}/instant-search`,
            { q, limit }
        );
    },

    globalQuickSearch: (q: string, limit: number = 5): Promise<GlobalQuickSearchResponse> => {
        return apiService.get<GlobalQuickSearchResponse>(
            "/v1/global-search/quick",
            { q, limit }
        );
    }
};

export default courseCatalogService;
