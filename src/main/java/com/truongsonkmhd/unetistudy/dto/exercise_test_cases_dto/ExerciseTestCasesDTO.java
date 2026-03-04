package com.truongsonkmhd.unetistudy.dto.exercise_test_cases_dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ExerciseTestCasesDTO {
    String input;
    String expectedOutput;
    Boolean isSample;
    String explanation;
    Integer orderIndex;
    Integer score;
}
