package com.truongsonkmhd.unetistudy.dto.ml_dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StudentRiskFeatureDTO {
    @JsonProperty("user_id")
    private String userId;

    @JsonProperty("course_id")
    private String courseId;

    @JsonProperty("lesson_completed_ratio")
    private Double lessonCompletedRatio;

    @JsonProperty("total_time_spent")
    private Integer totalTimeSpent;

    @JsonProperty("quiz_avg")
    private Double quizAvg;

    @JsonProperty("quiz_attempts")
    private Integer quizAttempts;

    @JsonProperty("code_pass_avg")
    private Double codePassAvg;

    @JsonProperty("code_attempts")
    private Integer codeAttempts;

    @JsonProperty("days_since_last_access")
    private Integer daysSinceLastAccess;
}
