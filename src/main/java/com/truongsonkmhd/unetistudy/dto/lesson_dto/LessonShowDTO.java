package com.truongsonkmhd.unetistudy.dto.lesson_dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LessonShowDTO {
     UUID lessonID;
     UUID moduleID;
     String title;
     String description;
     String type;
     String content;
     String image;
     Integer duration;
     Integer orderIndex;
     Boolean isPreview;
     Boolean isPublished;
     String slug;
}
