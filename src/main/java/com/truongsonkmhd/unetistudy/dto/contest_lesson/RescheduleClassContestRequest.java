package com.truongsonkmhd.unetistudy.dto.contest_lesson;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RescheduleClassContestRequest {
    private Instant newStartTime;
    private Instant newEndTime;
}
