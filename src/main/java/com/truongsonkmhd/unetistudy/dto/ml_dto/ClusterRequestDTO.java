package com.truongsonkmhd.unetistudy.dto.ml_dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ClusterRequestDTO {
    @JsonProperty("cluster_type")
    private String clusterType; // "BEHAVIORAL" | "PERFORMANCE" | "RISK"

    private List<?> students;
}
