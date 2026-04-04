package com.truongsonkmhd.unetistudy.dto.coding_exercise_dto;

import com.truongsonkmhd.unetistudy.common.Difficulty;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodingExerciseTemplateCardResponse {
    private UUID templateId;
    private String title;
    private String slug;
    private Difficulty difficulty;
    private String programmingLanguage;
    private String category;
    private Integer points;
    private Integer usageCount;
    private Boolean isPublished;
    private Instant createdAt;
}
