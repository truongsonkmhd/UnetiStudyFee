package com.truongsonkmhd.unetistudy.dto.class_dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateClazzRequest {

    String className;
    Instant startDate;
    Instant endDate;
    Boolean isActive;
}