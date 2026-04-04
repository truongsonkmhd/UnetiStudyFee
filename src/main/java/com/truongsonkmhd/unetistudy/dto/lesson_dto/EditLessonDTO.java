package com.truongsonkmhd.unetistudy.dto.lesson_dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EditLessonDTO {
    UUID lessonID;
    String title;
    String description;
    String image;
    Integer duration;
    String type;
    Boolean isContest;
    LocalDateTime contestStartTime;
    LocalDateTime contestEndTime;
    String slug;

}
