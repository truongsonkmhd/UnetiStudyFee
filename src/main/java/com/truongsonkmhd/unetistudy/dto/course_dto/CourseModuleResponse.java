package com.truongsonkmhd.unetistudy.dto.course_dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseModuleResponse {
    UUID moduleId;
    String title;
    Integer orderIndex;
    Boolean isPublished;
    List<CourseLessonResponse> lessons;
}
