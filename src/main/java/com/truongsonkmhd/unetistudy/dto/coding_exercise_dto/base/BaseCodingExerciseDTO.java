package com.truongsonkmhd.unetistudy.dto.coding_exercise_dto.base;

import com.truongsonkmhd.unetistudy.common.Difficulty;
import com.truongsonkmhd.unetistudy.dto.exercise_test_cases_dto.ExerciseTestCasesDTO;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BaseCodingExerciseDTO {

    UUID exerciseId;
    UUID templateId;

    String title;
    String description;

    String programmingLanguage;
    Difficulty difficulty;

    Integer points;
    Boolean isPublished;

    Integer timeLimitMs;
    Integer memoryLimitMb;

    String initialCode;
    String solutionCode;

    String slug;
    String inputFormat;
    String outputFormat;
    String constraintName;

    Instant createdAt;
    Instant updatedAt;

    List<ExerciseTestCasesDTO> exerciseTestCases;

}
