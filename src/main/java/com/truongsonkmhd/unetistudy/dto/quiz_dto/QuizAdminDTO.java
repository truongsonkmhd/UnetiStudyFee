package com.truongsonkmhd.unetistudy.dto.quiz_dto;

import lombok.*;
import jakarta.validation.constraints.*;

import java.time.Instant;
import java.util.*;

public class QuizAdminDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateQuizRequest {
        @NotBlank(message = "Quiz title is required")
        @Size(max = 255, message = "Title must not exceed 255 characters")
        private String title;

        private String description;

        @NotNull(message = "Contest lesson ID is required")
        private UUID contestLessonId;

        @Min(value = 0, message = "Pass score must be at least 0")
        @Max(value = 100, message = "Pass score must not exceed 100")
        private Double passScore;

        @Builder.Default
        private Boolean isPublished = true;

        @NotEmpty(message = "Quiz must have at least one question")
        private List<CreateQuestionRequest> questions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateQuestionRequest {
        @NotBlank(message = "Question content is required")
        private String content;

        @NotNull(message = "Question order is required")
        @Min(value = 1, message = "Question order must be at least 1")
        private Integer questionOrder;

        @Min(value = 1, message = "Time limit must be at least 1 second")
        @Builder.Default
        private Integer timeLimitSeconds = 5;

        @Min(value = 0, message = "Points must be at least 0")
        @Builder.Default
        private Double points = 1.0;

        @NotEmpty(message = "Question must have at least one answer")
        @Size(min = 2, message = "Question must have at least 2 answers")
        private List<CreateAnswerRequest> answers;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateAnswerRequest {
        @NotBlank(message = "Answer content is required")
        private String content;

        @NotNull(message = "Answer order is required")
        @Min(value = 1, message = "Answer order must be at least 1")
        private Integer answerOrder;

        @NotNull(message = "isCorrect flag is required")
        private Boolean isCorrect;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateQuizRequest {
        private String title;
        private Double passScore;
        private Boolean isPublished;
        private Integer maxAttempts;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateQuestionRequest {
        private String content;
        private Integer questionOrder;
        private Integer timeLimitSeconds;
        private Double points;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateAnswerRequest {
        private String content;
        private Integer answerOrder;
        private Boolean isCorrect;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuizResponse {
        private UUID quizId;
        private String title;
        private String description;
        private Integer totalQuestions;
        private Double passScore;
        private Boolean isPublished;
        private Integer maxAttempts;
        private UUID contestLessonId;
        private Instant createdAt;
        private Instant updatedAt;
        private List<QuestionResponse> questions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionResponse {
        private UUID questionId;
        private String content;
        private Integer questionOrder;
        private Integer timeLimitSeconds;
        private Double points;
        private List<AnswerResponse> answers;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnswerResponse {
        private UUID answerId;
        private String content;
        private Integer answerOrder;
        private Boolean isCorrect;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuizSummaryResponse {
        private UUID quizId;
        private String title;
        private Integer totalQuestions;
        private Double passScore;
        private Boolean isPublished;
        private Integer maxAttempts;
        private Instant createdAt;
        private Instant updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddQuestionRequest {
        @NotNull(message = "Quiz ID is required")
        private UUID quizId;

        @NotBlank(message = "Question content is required")
        private String content;

        @Min(value = 1, message = "Time limit must be at least 1 second")
        @Builder.Default
        private Integer timeLimitSeconds = 5;

        @Min(value = 0, message = "Points must be at least 0")
        @Builder.Default
        private Double points = 1.0;

        @NotEmpty(message = "Question must have at least one answer")
        @Size(min = 2, message = "Question must have at least 2 answers")
        private List<CreateAnswerRequest> answers;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddAnswerRequest {
        @NotNull(message = "Question ID is required")
        private UUID questionId;

        @NotBlank(message = "Answer content is required")
        private String content;

        @NotNull(message = "isCorrect flag is required")
        private Boolean isCorrect;
    }
}