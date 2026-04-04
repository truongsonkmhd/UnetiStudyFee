package com.truongsonkmhd.unetistudy.dto.coding_exercise_dto;

import com.truongsonkmhd.unetistudy.dto.coding_exercise_dto.base.BaseCodingExerciseDTO;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CodingExerciseTemplateDTO extends BaseCodingExerciseDTO {
    String category;
    String tags;
}
