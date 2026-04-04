package com.truongsonkmhd.unetistudy.dto.contest_lesson;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateClassContestRequest {

    @NotNull(message = "Class ID is required")
    UUID classId;

    @NotNull(message = "Contest Lesson ID is required")
    UUID contestLessonId;

    @NotNull(message = "Start time is required")
    @Future(message = "Start time must be in the future")
    Instant scheduledStartTime;

    @NotNull(message = "End time is required")
    Instant scheduledEndTime;

    @Min(value = 0, message = "Weight must be at least 0")
    @Max(value = 5, message = "Weight must not exceed 5")
    Double weight; // Null = use default 1.0

    @Min(value = 1, message = "Max attempts must be at least 1")
    @Max(value = 10, message = "Max attempts must not exceed 10")
    Integer maxAttemptsOverride;

    Boolean showLeaderboardOverride;

    @Size(max = 5000, message = "Instructions must not exceed 5000 characters")
    String instructionsOverride;

    @Min(value = 0, message = "Passing score must be at least 0")
    Integer passingScoreOverride;

    Boolean isActive; // Null = default true

    // Custom validation method
    @AssertTrue(message = "End time must be after start time")
    public boolean isEndTimeAfterStartTime() {
        if (scheduledStartTime == null || scheduledEndTime == null) {
            return true; // Let @NotNull handle this
        }
        return scheduledEndTime.isAfter(scheduledStartTime);
    }

    @AssertTrue(message = "Contest duration must be at least 15 minutes")
    public boolean isMinimumDuration() {
        if (scheduledStartTime == null || scheduledEndTime == null) {
            return true;
        }
        long minutes = java.time.Duration.between(scheduledStartTime, scheduledEndTime).toMinutes();
        return minutes >= 15;
    }
}