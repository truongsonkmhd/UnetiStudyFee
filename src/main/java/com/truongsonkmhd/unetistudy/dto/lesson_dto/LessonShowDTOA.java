package com.truongsonkmhd.unetistudy.dto.lesson_dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LessonShowDTOA {
    UUID lessonId;
    String courseModule;
    String title;
    String description;
    String type;
    String content;
    Integer duration;
    String roleName;
    String userName;
}
