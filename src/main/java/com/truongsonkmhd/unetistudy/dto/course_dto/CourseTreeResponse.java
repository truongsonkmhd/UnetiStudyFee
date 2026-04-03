package com.truongsonkmhd.unetistudy.dto.course_dto;

import com.truongsonkmhd.unetistudy.common.CourseStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseTreeResponse {
    UUID courseId;
    String title;
    String slug;
    String description;
    String shortDescription;
    String level;
    String category;
    String subCategory;
    Integer duration;
    Integer capacity;
    String requirements;
    String objectives;
    String syllabus;
    List<String> learningOutcomes;
    java.time.LocalDateTime publishedAt;
    Boolean isPublished;
    CourseStatus status;
    String imageUrl;
    String videoUrl;
    String youtubeVideoId;
    String embedUrl;
    List<CourseModuleResponse> modules;

    Integer enrolledCount;
    Double rating;
    Integer ratingCount;
    Instant updatedAt;
}
