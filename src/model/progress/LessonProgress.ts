export enum ProgressStatus {
    NOT_STARTED = 'NOT_STARTED',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE'
}

export interface LessonProgressRequest {
    lessonId: string;
    courseId: string;
    status: ProgressStatus;
    watchedPercent?: number;
    timeSpentSec?: number;
}

export interface LessonProgressResponse {
    progressId: string;
    userId: string;
    courseId: string;
    lessonId: string;
    lessonTitle: string;
    lessonSlug: string;
    status: ProgressStatus;
    watchedPercent: number;
    timeSpentSec: number;
    lastAccessAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface CourseProgressSummaryResponse {
    courseId: string;
    courseSlug: string;
    totalLessons: number;
    completedLessons: number;
    inProgressLessons: number;
    notStartedLessons: number;
    completionPercentage: number;

    // Last accessed lesson for auto-navigation
    lastAccessedLessonId?: string;
    lastAccessedLessonSlug?: string;
    lastAccessedLessonTitle?: string;
    lastAccessedModuleSlug?: string;
}
