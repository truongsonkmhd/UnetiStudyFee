package com.truongsonkmhd.unetistudy.dto.quiz_dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponse {
    private UUID questionId;
    private String content;
    private Integer questionOrder;
    private Integer timeLimitSeconds;
    private List<AnswerOption> answers;
    private Integer currentQuestion;
    private Integer totalQuestions;
}