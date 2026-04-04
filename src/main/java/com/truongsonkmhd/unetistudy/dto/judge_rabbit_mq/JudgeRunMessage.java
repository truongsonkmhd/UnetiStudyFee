package com.truongsonkmhd.unetistudy.dto.judge_rabbit_mq;

import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JudgeRunMessage {
    private UUID runId;
    private UUID exerciseId;
    private UUID userId;

    private String code;
    private String language;

    // For single test case run
    private String testCaseInput;
    private String testCaseId;

    private Instant createdAt;
}
