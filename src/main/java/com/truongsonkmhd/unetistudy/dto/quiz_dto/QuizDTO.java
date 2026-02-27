package com.truongsonkmhd.unetistudy.dto.quiz_dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizDTO {
    UUID quizId;
    UUID lessonId;
    UUID templateId;
    String title;
    Integer totalQuestions;
    Double passScore;
    Boolean isPublished;
    Integer maxAttempts;
    Double totalPoints;
}
