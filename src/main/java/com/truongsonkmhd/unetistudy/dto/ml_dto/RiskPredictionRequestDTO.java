package com.truongsonkmhd.unetistudy.dto.ml_dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class RiskPredictionRequestDTO {
    private List<StudentRiskFeatureDTO> students;
}
