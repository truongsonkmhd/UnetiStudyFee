package com.truongsonkmhd.unetistudy.dto.exercise_test_cases_dto;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ExerciseTestCasesDTO {
    UUID testCaseId;
    String input;
    String expectedOutput;
    Boolean isSample;
    String explanation;
    Integer orderIndex;
    Integer score;
}
