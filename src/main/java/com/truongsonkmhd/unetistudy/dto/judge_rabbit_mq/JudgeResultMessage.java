package com.truongsonkmhd.unetistudy.dto.judge_rabbit_mq;
import com.truongsonkmhd.unetistudy.common.SubmissionVerdict;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JudgeResultMessage {
    private UUID submissionId;
    private SubmissionVerdict verdict;
    private Integer passedTestcases;
    private Integer totalTestcases;
    private Integer runtimeMs;
    private Integer memoryKb;
    private Integer score;
    private Instant judgedAt;
}
