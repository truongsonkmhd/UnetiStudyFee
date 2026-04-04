package com.truongsonkmhd.unetistudy.dto.coding_submission;

import com.truongsonkmhd.unetistudy.common.SubmissionVerdict;
import com.truongsonkmhd.unetistudy.dto.coding_exercise_dto.JudgeRunResponseDTO;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CodingSubmissionResponseDTO {
    UUID submissionId;
    UUID exerciseID;
    UUID userID;
    String code;
    String language;
    SubmissionVerdict verdict;
    Integer passedTestcases;
    Integer totalTestcases;
    Integer runtimeMs;
    Integer memoryKb;
    Integer score;
    Instant submittedAt;
    String message;
    List<JudgeRunResponseDTO> testCaseResults;
}
