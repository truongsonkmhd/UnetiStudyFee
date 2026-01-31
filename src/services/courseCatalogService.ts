import apiService from "@/apis/apiService";
import { PageResponse } from "@/model/common/PageResponse";
import { CursorResponse } from "@/model/common/CursorResponse";
import { CourseCardResponse } from "@/model/course-admin/CourseCardResponse";

const CATALOG_BASE_ENDPOINT = "/course-catalog";

const courseCatalogService = {
    getPublishedCourses: (
        page: number = 0,
        size: number = 12,
        q?: string
    ): Promise<PageResponse<CourseCardResponse>> => {
        const queryParams = new URLSearchParams();
        queryParams.append("page", String(page));
        queryParams.append("size", String(size));
        if (q) queryParams.append("q", q);

        return apiService.get<PageResponse<CourseCardResponse>>(
            `${CATALOG_BASE_ENDPOINT}/published?${queryParams.toString()}`
        );
    },

    getPublishedCoursesScroll: (
        cursor?: string,
        size: number = 12,
        q?: string
    ): Promise<CursorResponse<CourseCardResponse>> => {
        const queryParams = new URLSearchParams();
        queryParams.append("size", String(size));
        if (cursor) queryParams.append("cursor", cursor);
        if (q) queryParams.append("q", q);

        return apiService.get<CursorResponse<CourseCardResponse>>(
            `${CATALOG_BASE_ENDPOINT}/published/scroll?${queryParams.toString()}`
        );
    }
};

export default courseCatalogService;
