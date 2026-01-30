import apiService from "@/apis/apiService";
import { PageResponse } from "@/model/common/PageResponse";
import { CourseCardResponse } from '@/model/course-admin/CourseCardResponse';
import { CourseShowRequest } from '@/model/course-admin/CourseShowRequest';
import { CourseTreeResponse } from '@/model/course-admin/CourseTreeResponse';

const COURSE_BASE_ENDPOINT = "/courses";

const courseService = {
  /**
   * Helper to convert an object (including nested ones and files) to FormData
   */
  toFormData: (data: any, formData: FormData = new FormData(), parentKey?: string) => {
    if (data === null || data === undefined) return formData;

    if (data instanceof File) {
      formData.append(parentKey!, data);
    } else if (Array.isArray(data)) {
      data.forEach((item, index) => {
        courseService.toFormData(item, formData, `${parentKey}[${index}]`);
      });
    } else if (typeof data === 'object' && !(data instanceof Date)) {
      Object.keys(data).forEach(key => {
        courseService.toFormData(data[key], formData, parentKey ? `${parentKey}.${key}` : key);
      });
    } else {
      formData.append(parentKey!, data);
    }
    return formData;
  },

  /**
   * Create a new course
   */
  createCourse: (courseData: CourseShowRequest): Promise<CourseTreeResponse> => {
    const formData = courseService.toFormData(courseData);
    return apiService.post<CourseTreeResponse>(`${COURSE_BASE_ENDPOINT}/add`, formData);
  },

  /**
   * Update an existing course
   */
  updateCourse: (
    courseId: string,
    courseData: CourseShowRequest
  ): Promise<CourseTreeResponse> => {
    const formData = courseService.toFormData(courseData);
    return apiService.put<CourseTreeResponse>(
      `${COURSE_BASE_ENDPOINT}/upd/${courseId}`,
      formData
    );
  },

  /**
   * Delete a course by ID
   */
  deleteCourse: (courseId: string): Promise<string> =>
    apiService.delete<string>(`${COURSE_BASE_ENDPOINT}/delete/${courseId}`),

  /**
   * Get course by ID
   */
  getCourseById: (courseId: string): Promise<CourseTreeResponse> =>
    apiService.get<CourseTreeResponse>(
      `${COURSE_BASE_ENDPOINT}/getCourseById/${courseId}`
    ),

  /**
   * Get course tree by slug (for students)
   */
  getCourseTreeBySlug: (slug: string): Promise<CourseTreeResponse> =>
    apiService.get<CourseTreeResponse>(`${COURSE_BASE_ENDPOINT}/${slug}/tree`),

  /**
   * Get course modules by slug
   */
  getCourseModulesBySlug: (slug: string): Promise<CourseTreeResponse> =>
    apiService.get<CourseTreeResponse>(
      `${COURSE_BASE_ENDPOINT}/getCourseBySlug/${slug}`
    ),

  /**
   * Upload course video
   */
  uploadCourseVideo: (courseId: string, videoFile: File): Promise<string> => {
    const formData = new FormData();
    formData.append('videoFile', videoFile);

    return apiService.post<string>(
      `${COURSE_BASE_ENDPOINT}/upload-video/${courseId}`,
      formData
    );
  },

  /**
   * Get all courses (with optional filters)
   */
  getAllCourses: (params?: {
    page?: number;
    size?: number;
    status?: string;
    category?: string;
  }): Promise<PageResponse<CourseCardResponse>> =>
    apiService.get<PageResponse<CourseCardResponse>>(`${COURSE_BASE_ENDPOINT}`, params),
};

export default courseService;