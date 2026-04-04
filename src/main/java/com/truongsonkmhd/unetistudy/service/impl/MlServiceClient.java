package com.truongsonkmhd.unetistudy.service.impl;

import com.truongsonkmhd.unetistudy.dto.ml_dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
public class MlServiceClient {

    private final RestTemplate restTemplate;
    private final String mlServiceUrl;

    public MlServiceClient(RestTemplate restTemplate, @Qualifier("mlServiceUrl") String mlServiceUrl) {
        this.restTemplate = restTemplate;
        this.mlServiceUrl = mlServiceUrl;
    }

    /**
     * Gọi endpoint /cluster của FastAPI
     */
    public ClusterResponseDTO cluster(ClusterRequestDTO request) {
        try {
            String url = mlServiceUrl + "/cluster";
            log.info("[ML] POST {} - clusterType={}, students={}",
                    url, request.getClusterType(),
                    request.getStudents() != null ? request.getStudents().size() : 0);

            ResponseEntity<ClusterResponseDTO> response =
                    restTemplate.postForEntity(url, request, ClusterResponseDTO.class);

            log.info("[ML] Response status: {}", response.getStatusCode());
            return response.getBody();
        } catch (Exception e) {
            log.error("[ML] Cluster request failed: {}", e.getMessage());
            throw new RuntimeException("ML Service không khả dụng: " + e.getMessage(), e);
        }
    }

    /**
     * Gọi endpoint /predict/risk của FastAPI
     */
    public RiskPredictionResponseDTO predictRisk(RiskPredictionRequestDTO request) {
        try {
            String url = mlServiceUrl + "/predict/risk";
            log.info("[ML] POST {} - students={}",
                    url,
                    request.getStudents() != null ? request.getStudents().size() : 0);

            ResponseEntity<RiskPredictionResponseDTO> response =
                    restTemplate.postForEntity(url, request, RiskPredictionResponseDTO.class);

            log.info("[ML] Response status: {}", response.getStatusCode());
            return response.getBody();
        } catch (Exception e) {
            log.error("[ML] Risk prediction request failed: {}", e.getMessage());
            throw new RuntimeException("ML Service không khả dụng: " + e.getMessage(), e);
        }
    }
}
