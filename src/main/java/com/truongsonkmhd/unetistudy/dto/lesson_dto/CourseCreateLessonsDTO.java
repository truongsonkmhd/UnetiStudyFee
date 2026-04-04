package com.truongsonkmhd.unetistudy.dto.lesson_dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseCreateLessonsDTO {
    String courseName;
    String title;
    String description;
    String type;
    String content;
    Integer duration;
    String image;
    Integer orderIndex;
}