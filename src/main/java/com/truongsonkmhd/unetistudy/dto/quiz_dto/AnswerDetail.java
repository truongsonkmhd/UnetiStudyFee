package com.truongsonkmhd.unetistudy.dto.quiz_dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnswerDetail {
    private UUID answerId;
    private String content;
    private Boolean isCorrect;
    private Boolean isSelected;
}
