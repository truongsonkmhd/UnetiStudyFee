package com.truongsonkmhd.unetistudy.dto.quiz_dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

public class QuestionTemplateDTO {

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class Response {
        UUID questionTemplateId;
        String content;
        Integer questionOrder;
        Integer timeLimitSeconds;
        Double points;
        List<AnswerTemplateDTO.Response> answers;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class CreateRequest {
        String content;
        Integer questionOrder;
        Integer timeLimitSeconds;
        Double points;
        List<AnswerTemplateDTO.CreateRequest> answers;
    }
}