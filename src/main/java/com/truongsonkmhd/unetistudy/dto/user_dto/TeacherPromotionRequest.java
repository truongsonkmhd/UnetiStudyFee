package com.truongsonkmhd.unetistudy.dto.user_dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TeacherPromotionRequest {
    String teacherId;
    String department;
}
