package com.truongsonkmhd.unetistudy.dto.progress_dto;

import com.truongsonkmhd.unetistudy.common.ProgressStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO for lesson progress response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonProgressResponse {

    private UUID progressId;
    private UUID userId;
    private UUID courseId;
    private UUID lessonId;
    private String lessonTitle;
    private String lessonSlug;
    private ProgressStatus status;
    private Integer watchedPercent;
    private Integer timeSpentSec;
    private Instant lastAccessAt;
    private Instant createdAt;
    private Instant updatedAt;
}
