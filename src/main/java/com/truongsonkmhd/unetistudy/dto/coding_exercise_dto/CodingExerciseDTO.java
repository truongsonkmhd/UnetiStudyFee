package com.truongsonkmhd.unetistudy.dto.coding_exercise_dto;

import com.truongsonkmhd.unetistudy.dto.coding_exercise_dto.base.BaseCodingExerciseDTO;
import lombok.*;
import lombok.experimental.FieldDefaults;

import lombok.experimental.SuperBuilder;

import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CodingExerciseDTO extends BaseCodingExerciseDTO {

    UUID contestLessonId;

    UUID templateId;
}
