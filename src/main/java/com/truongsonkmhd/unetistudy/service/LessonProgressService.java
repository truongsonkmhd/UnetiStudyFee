package com.truongsonkmhd.unetistudy.service;

import com.truongsonkmhd.unetistudy.dto.progress_dto.CourseProgressSummaryResponse;
import com.truongsonkmhd.unetistudy.dto.progress_dto.LessonProgressRequest;
import com.truongsonkmhd.unetistudy.dto.progress_dto.LessonProgressResponse;

import java.util.List;
import java.util.UUID;

/**
 * Service interface for managing lesson progress
 */
public interface LessonProgressService {

    /**
     * Update or create lesson progress for a user
     */
    LessonProgressResponse updateProgress(UUID userId, LessonProgressRequest request);

    /**
     * Get all progress for a user in a course
     */
    List<LessonProgressResponse> getCourseProgress(UUID userId, UUID courseId);

    /**
     * Get course progress summary with completion stats
     */
    CourseProgressSummaryResponse getCourseSummary(UUID userId, UUID courseId);

    /**
     * Get progress for a specific lesson
     */
    LessonProgressResponse getLessonProgress(UUID userId, UUID courseId, UUID lessonId);
}
