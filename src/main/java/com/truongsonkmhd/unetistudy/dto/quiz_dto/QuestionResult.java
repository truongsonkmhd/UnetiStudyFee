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
public class QuestionResult {
    private UUID questionId;
    private String questionContent;
    private Boolean isCorrect;
    private Double pointsEarned;
    private Double maxPoints;
    private Integer timeSpentSeconds;
    private Boolean isTimeout;
    private List<AnswerDetail> answers;
}