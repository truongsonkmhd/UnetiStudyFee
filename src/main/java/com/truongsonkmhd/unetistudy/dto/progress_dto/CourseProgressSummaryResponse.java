package com.truongsonkmhd.unetistudy.dto.progress_dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Summary of user's progress in a course
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseProgressSummaryResponse {

    private UUID courseId;
    private String courseSlug;
    private Integer totalLessons;
    private Integer completedLessons;
    private Integer inProgressLessons;
    private Integer notStartedLessons;
    private Double completionPercentage;

    // Last accessed lesson info for auto-navigation
    private UUID lastAccessedLessonId;
    private String lastAccessedLessonSlug;
    private String lastAccessedLessonTitle;
    private String lastAccessedModuleSlug;
}
