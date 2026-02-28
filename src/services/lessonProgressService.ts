import apiService from "@/apis/apiService";
import {
    LessonProgressRequest,
    LessonProgressResponse,
    CourseProgressSummaryResponse
} from "@/model/progress/LessonProgress";

const PROGRESS_BASE_ENDPOINT = "/progress";

const lessonProgressService = {
    /**
     * Update or create lesson progress
     */
    updateProgress: (
        request: LessonProgressRequest
    ): Promise<LessonProgressResponse> => {
        return apiService.post<LessonProgressResponse>(
            PROGRESS_BASE_ENDPOINT,
            request
        );
    },

    /**
     * Get all progress for a course
     */
    getCourseProgress: (
        courseId: string
    ): Promise<LessonProgressResponse[]> => {
        return apiService.get<LessonProgressResponse[]>(
            `${PROGRESS_BASE_ENDPOINT}/course/${courseId}`
        );
    },

    /**
     * Get course progress summary with stats and last accessed lesson
     */
    getCourseSummary: (
        courseId: string
    ): Promise<CourseProgressSummaryResponse> => {
        return apiService.get<CourseProgressSummaryResponse>(
            `${PROGRESS_BASE_ENDPOINT}/course/${courseId}/summary`
        );
    },

    /**
     * Get progress for a specific lesson
     */
    getLessonProgress: (
        courseId: string,
        lessonId: string
    ): Promise<LessonProgressResponse | null> => {
        return apiService.get<LessonProgressResponse>(
            `${PROGRESS_BASE_ENDPOINT}/course/${courseId}/lesson/${lessonId}`
        ).catch(() => null); // Return null if no progress exists
    }
};

export default lessonProgressService;
