package com.truongsonkmhd.unetistudy.dto.coding_exercise_dto;

import com.truongsonkmhd.unetistudy.dto.coding_exercise_dto.base.BaseCodingExerciseDTO;
import com.truongsonkmhd.unetistudy.dto.exercise_test_cases_dto.ExerciseTestCasesDTO;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.util.List;
import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ContestCodingExerciseDTO extends BaseCodingExerciseDTO {

    UUID exerciseId;

    UUID contestLessonId;

    UUID templateId;

    Integer orderIndex;
    Boolean isBonus;

    List<ExerciseTestCasesDTO> exerciseTestCases;
}
