package com.truongsonkmhd.unetistudy.dto.ml_dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class StudentRiskResultDTO {
    @JsonProperty("user_id")
    private String userId;

    @JsonProperty("course_id")
    private String courseId;

    @JsonProperty("risk_probability")
    private Double riskProbability; // 0.0 -> 1.0

    @JsonProperty("risk_level")
    private String riskLevel; // "LOW", "MEDIUM", "HIGH"
}
