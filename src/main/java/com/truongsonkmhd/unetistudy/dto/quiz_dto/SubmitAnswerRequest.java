package com.truongsonkmhd.unetistudy.dto.quiz_dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitAnswerRequest {
    private UUID questionId;
    private Set<UUID> selectedAnswerIds;
    private Integer timeSpentSeconds;
}