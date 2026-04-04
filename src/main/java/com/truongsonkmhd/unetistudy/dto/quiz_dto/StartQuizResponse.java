package com.truongsonkmhd.unetistudy.dto.quiz_dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StartQuizResponse {
    private UUID attemptId;
    private UUID quizId;
    private String quizTitle;
    private Integer totalQuestions;
    private Instant startedAt;
}