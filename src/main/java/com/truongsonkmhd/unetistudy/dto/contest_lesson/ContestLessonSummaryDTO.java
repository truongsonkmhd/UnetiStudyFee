package com.truongsonkmhd.unetistudy.dto.contest_lesson;

import com.truongsonkmhd.unetistudy.common.StatusContest;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ContestLessonSummaryDTO {
    UUID contestLessonId;
    String title;
    String description;
    Integer totalPoints;
    Integer defaultDurationMinutes;
    Integer defaultMaxAttempts;
    Integer passingScore;
    StatusContest status;
    Boolean isActive;
    Instant createdAt;
    Instant updatedAt;
    Integer codingExerciseCount;
    Integer quizQuestionCount;
    Integer activeClassCount;


    public ContestLessonSummaryDTO(UUID contestLessonId, String title, String description,
            Integer totalPoints, Integer defaultDurationMinutes,
            Integer defaultMaxAttempts, Integer passingScore,
            StatusContest status, Boolean isActive,
            Instant createdAt, Instant updatedAt,
            int codingExerciseCount, int quizQuestionCount,
            int activeClassCount) {
        this.contestLessonId = contestLessonId;
        this.title = title;
        this.description = description;
        this.totalPoints = totalPoints;
        this.defaultDurationMinutes = defaultDurationMinutes;
        this.defaultMaxAttempts = defaultMaxAttempts;
        this.passingScore = passingScore;
        this.status = status;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.codingExerciseCount = codingExerciseCount;
        this.quizQuestionCount = quizQuestionCount;
        this.activeClassCount = activeClassCount;
    }

    public ContestLessonSummaryDTO(UUID contestLessonId, String title, String description,
            Integer totalPoints, Integer defaultDurationMinutes,
            Integer defaultMaxAttempts, Integer passingScore,
            StatusContest status, Boolean isActive,
            Instant createdAt, Instant updatedAt,
            Long codingExerciseCount, Long quizQuestionCount,
            Long activeClassCount) {
        this.contestLessonId = contestLessonId;
        this.title = title;
        this.description = description;
        this.totalPoints = totalPoints;
        this.defaultDurationMinutes = defaultDurationMinutes;
        this.defaultMaxAttempts = defaultMaxAttempts;
        this.passingScore = passingScore;
        this.status = status;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.codingExerciseCount = codingExerciseCount != null ? codingExerciseCount.intValue() : 0;
        this.quizQuestionCount = quizQuestionCount != null ? quizQuestionCount.intValue() : 0;
        this.activeClassCount = activeClassCount != null ? activeClassCount.intValue() : 0;
    }
}
