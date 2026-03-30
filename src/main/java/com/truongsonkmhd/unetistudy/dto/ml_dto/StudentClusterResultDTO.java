package com.truongsonkmhd.unetistudy.dto.ml_dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class StudentClusterResultDTO {
    @JsonProperty("user_id")
    private String userId;

    @JsonProperty("course_id")
    private String courseId;

    @JsonProperty("cluster_id")
    private Integer clusterId;

    @JsonProperty("cluster_label")
    private String clusterLabel;

    @JsonProperty("cluster_score")
    private Double clusterScore;

    // --- User info (enrichọ từ DB sau khi nhận ML response) ---
    @JsonProperty("full_name")
    private String fullName;

    @JsonProperty("username")
    private String username;

    @JsonProperty("avatar")
    private String avatar;
}
