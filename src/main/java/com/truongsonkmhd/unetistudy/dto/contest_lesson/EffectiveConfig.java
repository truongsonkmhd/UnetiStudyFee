package com.truongsonkmhd.unetistudy.dto.contest_lesson;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EffectiveConfig {
    Integer maxAttempts;
    Boolean showLeaderboard;
    String instructions;
    Integer passingScore;
    Integer totalPoints;
}