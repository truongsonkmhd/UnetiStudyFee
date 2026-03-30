package com.truongsonkmhd.unetistudy.dto.ml_dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StudentPerformanceFeatureDTO {
    @JsonProperty("user_id")
    private String userId;

    @JsonProperty("course_id")
    private String courseId;

    @JsonProperty("quiz_avg_score")
    private Double quizAvgScore;    // điểm quiz trung bình

    @JsonProperty("quiz_fail_rate")
    private Double quizFailRate;    // tỉ lệ lần quiz không pass

    @JsonProperty("coding_ac_rate")
    private Double codingAcRate;    // tỉ lệ code accepted

    @JsonProperty("avg_runtime_ms")
    private Double avgRuntimeMs;    // runtime trung bình

    @JsonProperty("attempt_count")
    private Integer attemptCount;   // số lần làm bài
}
