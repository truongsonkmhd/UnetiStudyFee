package com.truongsonkmhd.unetistudy.controller;

import com.truongsonkmhd.unetistudy.dto.ml_dto.ClusterResponseDTO;
import com.truongsonkmhd.unetistudy.dto.ml_dto.RiskPredictionResponseDTO;
import com.truongsonkmhd.unetistudy.service.impl.StudentAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class StudentAnalyticsController {

    private final StudentAnalyticsService analyticsService;

    /**
     * Phân nhóm hành vi học tập (5 features)
     * GET /api/v1/analytics/cluster/behavioral?courseId=xxx
     */
    @GetMapping("/cluster/behavioral")
    public ResponseEntity<ClusterResponseDTO> clusterBehavioral(
            @RequestParam(defaultValue = "") String courseId) {
        return ResponseEntity.ok(analyticsService.clusterBehavioral(courseId));
    }

    /**
     * Phân nhóm năng lực (quiz + coding)
     * GET /api/v1/analytics/cluster/performance?courseId=xxx
     */
    @GetMapping("/cluster/performance")
    public ResponseEntity<ClusterResponseDTO> clusterPerformance(
            @RequestParam(defaultValue = "") String courseId) {
        return ResponseEntity.ok(analyticsService.clusterPerformance(courseId));
    }

    /**
     * Phân nhóm nguy cơ bỏ học (KMeans 3 nhóm)
     * GET /api/v1/analytics/cluster/risk?courseId=xxx
     */
    @GetMapping("/cluster/risk")
    public ResponseEntity<ClusterResponseDTO> clusterRisk(
            @RequestParam(defaultValue = "") String courseId) {
        return ResponseEntity.ok(analyticsService.clusterRisk(courseId));
    }

    /**
     * Dự đoán xác suất bỏ học (Random Forest)
     * GET /api/v1/analytics/predict/risk?courseId=xxx
     */
    @GetMapping("/predict/risk")
    public ResponseEntity<RiskPredictionResponseDTO> predictRisk(
            @RequestParam(defaultValue = "") String courseId) {
        return ResponseEntity.ok(analyticsService.predictDropoutRisk(courseId));
    }
}
