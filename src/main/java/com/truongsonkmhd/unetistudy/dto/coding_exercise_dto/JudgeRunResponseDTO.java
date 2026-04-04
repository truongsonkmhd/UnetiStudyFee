package com.truongsonkmhd.unetistudy.dto.coding_exercise_dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class JudgeRunResponseDTO {
    String output; // raw output (deprecated but kept for compatibility)
    String status; // ACCEPTED | WRONG_ANSWER | COMPILATION_ERROR | RUNTIME_ERROR | SUCCESS
    String message; // human-readable summary

    // Extended fields for single test case run
    String verdict; // ACCEPTED | WRONG_ANSWER | COMPILATION_ERROR | RUNTIME_ERROR
    String actualOutput; // actual output from execution
    String expectedOutput; // expected output (if known test case)
    String input; // the input that was used
    Integer runtimeMs; // runtime in milliseconds
    Integer memoryKb; // memory in kilobytes
    Boolean isKnownTestCase; // whether this matched a known test case
    String testCaseId; // id of matched test case
    Integer points; // points awarded if passed
}
