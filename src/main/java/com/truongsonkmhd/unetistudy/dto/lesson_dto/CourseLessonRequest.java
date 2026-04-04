package com.truongsonkmhd.unetistudy.dto.lesson_dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.truongsonkmhd.unetistudy.common.LessonType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseLessonRequest {

     UUID lessonId; // update thì gửi, create thì null
     UUID moduleId;
     UUID creatorId;

     String title;
     String description;
     String content;
     String videoUrl; // YouTube URL, ví dụ: https://www.youtube.com/watch?v=XXX

     Integer orderIndex;

     @JsonProperty("isPreview")
     Boolean isPreview;
     @JsonProperty("isPublished")
     Boolean isPublished;

     String slug;
     LessonType lessonType;

     Integer totalPoints;

     List<UUID> exerciseTemplateIds;
     List<UUID> quizTemplateIds;
}
