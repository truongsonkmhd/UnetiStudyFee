package com.truongsonkmhd.unetistudy.dto.contest_lesson;


import lombok.*;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContestInfo {
    UUID contestLessonId;
    String title; // Từ CourseLesson
    String description;
    Integer defaultTotalPoints;
    Integer codingExerciseCount;
    Integer quizQuestionCount;
}