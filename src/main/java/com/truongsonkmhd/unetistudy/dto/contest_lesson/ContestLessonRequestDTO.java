package com.truongsonkmhd.unetistudy.dto.contest_lesson;


import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ContestLessonRequestDTO {
    String title;

    String description;

    Integer defaultDurationMinutes;

    Integer totalPoints;

    Integer defaultMaxAttempts;

    Integer passingScore;

    Boolean showLeaderboardDefault;

    String instructions;

    List<UUID> exerciseTemplateIds;

    List<UUID> quizTemplateIds;
}
