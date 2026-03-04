package com.truongsonkmhd.unetistudy.dto.judge_rabbit_mq;

import com.truongsonkmhd.unetistudy.common.SubmissionVerdict;
import lombok.*;

@Getter @Setter
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
}
