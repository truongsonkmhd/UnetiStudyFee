package com.truongsonkmhd.unetistudy.dto.ml_dto;

import lombok.Data;

import java.util.List;

@Data
public class RiskPredictionResponseDTO {
    private List<StudentRiskResultDTO> results;
}
