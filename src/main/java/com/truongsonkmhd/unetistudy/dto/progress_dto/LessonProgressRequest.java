package com.truongsonkmhd.unetistudy.dto.progress_dto;

import com.truongsonkmhd.unetistudy.common.ProgressStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for updating lesson progress
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonProgressRequest {

    @NotNull(message = "Lesson ID is required")
    private UUID lessonId;

    @NotNull(message = "Course ID is required")
    private UUID courseId;

    @NotNull(message = "Status is required")
    private ProgressStatus status;

    @Min(value = 0, message = "Watched percent must be between 0 and 100")
    @Max(value = 100, message = "Watched percent must be between 0 and 100")
    private Integer completionPercent;

    @Min(value = 0, message = "Time spent must be non-negative")
    private Integer timeSpentSec;
}
