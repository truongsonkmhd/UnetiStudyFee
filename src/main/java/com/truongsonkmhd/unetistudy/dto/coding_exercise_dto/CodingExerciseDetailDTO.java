package com.truongsonkmhd.unetistudy.dto.coding_exercise_dto;

import com.truongsonkmhd.unetistudy.dto.exercise_test_cases_dto.ExerciseTestCasesDTO;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CodingExerciseDetailDTO {
    UUID exerciseID;
    UUID contestLessonId;
    Set<ExerciseTestCasesDTO> exerciseTestCases;

    String title;
    String description;
    String programmingLanguage;
    String initialCode;

    Integer timeLimit;
    Integer memoryLimit;

    Integer points;
    Boolean isPublished;
}
