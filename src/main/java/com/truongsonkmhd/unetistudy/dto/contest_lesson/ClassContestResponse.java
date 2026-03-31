package com.truongsonkmhd.unetistudy.dto.contest_lesson;


import com.truongsonkmhd.unetistudy.common.ClassContestStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ClassContestResponse {

    UUID classContestId;

    // Thông tin lớp học
    ClassInfo classInfo;

    // Thông tin contest template
    ContestInfo contestInfo;

    // Thời gian thi
    Instant scheduledStartTime;
    Instant scheduledEndTime;
    Long durationInMinutes;

    // Cấu hình
    ClassContestStatus status;
    Boolean isActive;
    Double weight;

    // Cấu hình hiệu quả
    EffectiveConfig effectiveConfig;

    Instant createdAt;
    Instant updatedAt;

}