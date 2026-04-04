package com.truongsonkmhd.unetistudy.dto.quiz_dto;


import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;


public class AnswerTemplateDTO {

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class Response {
        UUID answerTemplateId;
        String content;
        Boolean isCorrect;
        Integer answerOrder;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class CreateRequest {
        String content;
        Boolean isCorrect;
        Integer answerOrder;
    }
}