package com.truongsonkmhd.unetistudy.dto.class_dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateClazzRequest {

    String className;
    UUID instructorId;
    Instant startDate;
    Instant endDate;
    Integer maxStudents;
    Boolean isActive;
}