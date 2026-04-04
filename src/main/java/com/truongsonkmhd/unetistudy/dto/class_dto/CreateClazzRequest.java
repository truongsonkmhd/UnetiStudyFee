package com.truongsonkmhd.unetistudy.dto.class_dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CreateClazzRequest {

    @NotBlank
    String classCode;

    @NotBlank
    String className;

    @NotNull
    UUID instructorId;

    @NotNull
    Instant startDate;

    Instant endDate;

    Integer maxStudents;
}
