package com.truongsonkmhd.unetistudy.dto.lesson_dto;


import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ContestLessonRequest {

    UUID courseLessonId;   // lesson gốc

    Instant startTime;
    Instant endTime;

    Integer totalPoints;
    Integer maxAttempts;

    Boolean isActive;
    Boolean showLeaderboard;
}
