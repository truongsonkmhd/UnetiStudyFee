package com.truongsonkmhd.unetistudy.dto.course_dto;

import com.truongsonkmhd.unetistudy.common.LessonType;
import com.truongsonkmhd.unetistudy.dto.coding_exercise_dto.CodingExerciseDTO;
import com.truongsonkmhd.unetistudy.dto.quiz_dto.QuizDTO;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseLessonResponse {
    UUID lessonId;
    String title;
    Integer orderIndex;
    LessonType lessonType;
    Boolean isPreview;
    Boolean isPublished;
    String videoUrl;
    String description;
    String content;
    String slug;
    Integer totalPoints;
    Integer duration;

    List<CodingExerciseDTO> codingExercises;
    List<QuizDTO> quizzes;
}
