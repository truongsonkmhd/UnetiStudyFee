package com.truongsonkmhd.unetistudy.dto.contest_lesson;

import com.truongsonkmhd.unetistudy.common.StatusContest;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import com.truongsonkmhd.unetistudy.dto.coding_exercise_dto.ContestCodingExerciseDTO;
import com.truongsonkmhd.unetistudy.dto.quiz_dto.QuizDTO;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ContestLessonResponseDTO {
    public ContestLessonResponseDTO(UUID contestLessonId, String title, String description,
            Integer defaultDurationMinutes, Integer totalPoints,
            Integer defaultMaxAttempts, Integer passingScore,
            Boolean showLeaderboardDefault, String instructions,
            StatusContest status) {
        this.contestLessonId = contestLessonId;
        this.title = title;
        this.description = description;
        this.defaultDurationMinutes = defaultDurationMinutes;
        this.totalPoints = totalPoints;
        this.defaultMaxAttempts = defaultMaxAttempts;
        this.passingScore = passingScore;
        this.showLeaderboardDefault = showLeaderboardDefault;
        this.instructions = instructions;
        this.status = status;
    }

    UUID contestLessonId;
    String title;

    String description;

    Integer defaultDurationMinutes;

    Integer totalPoints;

    Integer defaultMaxAttempts;

    Integer passingScore;

    Boolean showLeaderboardDefault;

    String instructions;

    StatusContest status;

    List<ContestCodingExerciseDTO> codingExercises;

    List<QuizDTO> quizzes;

}
