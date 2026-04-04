package com.truongsonkmhd.unetistudy.dto.quiz_dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class QuizTemplateDTO {

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class Response {
        UUID templateId;
        String templateName;
        String description;
        String category;
        String thumbnailUrl;
        Double passScore;

        Boolean isActive;
        Integer usageCount;
        Integer totalQuestions;
        String createdBy;
        Long version;
        Integer maxAttempts;
        Instant createdAt;
        Instant updatedAt;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class DetailResponse {
        UUID templateId;
        String templateName;
        String description;
        String category;
        String thumbnailUrl;
        Double passScore;

        Boolean isActive;
        Integer usageCount;
        String createdBy;
        Long version;
        Integer maxAttempts;
        List<QuestionTemplateDTO.Response> questions;
        Instant createdAt;
        Instant updatedAt;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class CreateRequest {
        String templateName;
        String description;
        String category;
        String thumbnailUrl;
        Double passScore;

        Integer maxAttempts;
        List<QuestionTemplateDTO.CreateRequest> questions;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class UpdateRequest {
        Long version;
        String templateName;
        String description;
        String category;
        String thumbnailUrl;
        Double passScore;
        Integer maxAttempts;
        Boolean isActive;
    }
}
