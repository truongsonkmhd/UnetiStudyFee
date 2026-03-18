package com.truongsonkmhd.unetistudy.dto.judge_rabbit_mq;

import com.truongsonkmhd.unetistudy.common.SubmissionVerdict;
import com.truongsonkmhd.unetistudy.dto.coding_exercise_dto.JudgeRunResponseDTO;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JudgeInternalResult {
    private SubmissionVerdict verdict;
    private int passed;
    private int total;
    private int score;
    private Integer runtimeMs;
    private Integer memoryKb;
    private String message;
    private List<JudgeRunResponseDTO> testCaseResults;
}
