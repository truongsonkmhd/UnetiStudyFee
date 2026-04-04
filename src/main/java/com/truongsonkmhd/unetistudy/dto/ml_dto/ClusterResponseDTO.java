package com.truongsonkmhd.unetistudy.dto.ml_dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class ClusterResponseDTO {
    @JsonProperty("cluster_type")
    private String clusterType;

    private List<StudentClusterResultDTO> results;

    @JsonProperty("cluster_summary")
    private Map<String, Integer> clusterSummary; // thống kê số học sinh mỗi nhóm
}
