package com.truongsonkmhd.unetistudy.dto.class_dto;

import com.truongsonkmhd.unetistudy.dto.contest_lesson.ClassContestResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ClazzResponse {

    UUID classId;
    String classCode;
    String className;
    String inviteCode;

    // Instructor
    UUID instructorId;
    String instructorName;

    Instant startDate;
    Instant endDate;

    Integer maxStudents;
    Boolean isActive;

    Instant createdAt;
    Instant updatedAt;

    List<ClassContestResponse> contests;
}
