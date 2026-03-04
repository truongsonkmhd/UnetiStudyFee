import apiService from "@/apis/apiService";

const LESSON_BASE_ENDPOINT = "/course-lesson";
const MODULE_BASE_ENDPOINT = "/course-module";

const lessonService = {
    /**
     * Check if a lesson has any student submissions (coding exams or quiz attempts)
     */
    hasSubmissions: (lessonId: string): Promise<boolean> =>
        apiService.get<boolean>(`${LESSON_BASE_ENDPOINT}/hasSubmissions/${lessonId}`),

    /**
     * Check if a module has any student submissions in any of its lessons
     */
    hasModuleSubmissions: (moduleId: string): Promise<boolean> =>
        apiService.get<boolean>(`${MODULE_BASE_ENDPOINT}/hasSubmissions/${moduleId}`),
};

export default lessonService;
