package com.truongsonkmhd.unetistudy.controller.clazz;

import com.truongsonkmhd.unetistudy.dto.a_common.IResponseMessage;
import com.truongsonkmhd.unetistudy.dto.a_common.ResponseMessage;
import com.truongsonkmhd.unetistudy.service.impl.ClassAnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Endpoints AI Analytics theo phạm vi lớp học.
 * Chỉ giáo viên của lớp mới được gọi (phân quyền cấu hình tại Security layer).
 *
 * GET /api/class/{classId}/analytics/behavioral    — Phân nhóm hành vi học tập
 * GET /api/class/{classId}/analytics/performance   — Phân nhóm năng lực
 * GET /api/class/{classId}/analytics/risk-cluster  — Phân nhóm rủi ro (KMeans)
 * GET /api/class/{classId}/analytics/risk-predict  — Dự đoán bỏ học (RandomForest)
 */
@RestController
@RequestMapping("/api/class/{classId}/analytics")
@Slf4j(topic = "CLASS-ANALYTICS-CONTROLLER")
@Tag(name = "class analytics", description = "AI Analytics theo phạm vi lớp học")
@RequiredArgsConstructor
public class ClassAnalyticsController {

    private final ClassAnalyticsService classAnalyticsService;

    @GetMapping("/behavioral")
    @Operation(summary = "Phân nhóm hành vi học tập của học sinh trong lớp")
    public ResponseEntity<IResponseMessage> clusterBehavioral(@PathVariable UUID classId) {
        log.info("[ClassAnalytics] Behavioral request classId={}", classId);
        return ResponseEntity.ok().body(
                ResponseMessage.LoadedSuccess(classAnalyticsService.clusterBehavioral(classId)));
    }

    @GetMapping("/performance")
    @Operation(summary = "Phân nhóm năng lực học tập của học sinh trong lớp")
    public ResponseEntity<IResponseMessage> clusterPerformance(@PathVariable UUID classId) {
        log.info("[ClassAnalytics] Performance request classId={}", classId);
        return ResponseEntity.ok().body(
                ResponseMessage.LoadedSuccess(classAnalyticsService.clusterPerformance(classId)));
    }

    @GetMapping("/risk-cluster")
    @Operation(summary = "Phân nhóm rủi ro bỏ học bằng KMeans")
    public ResponseEntity<IResponseMessage> clusterRisk(@PathVariable UUID classId) {
        log.info("[ClassAnalytics] Risk-cluster request classId={}", classId);
        return ResponseEntity.ok().body(
                ResponseMessage.LoadedSuccess(classAnalyticsService.clusterRisk(classId)));
    }

    @GetMapping("/risk-predict")
    @Operation(summary = "Dự đoán xác suất bỏ học bằng Random Forest")
    public ResponseEntity<IResponseMessage> predictRisk(@PathVariable UUID classId) {
        log.info("[ClassAnalytics] Risk-predict request classId={}", classId);
        return ResponseEntity.ok().body(
                ResponseMessage.LoadedSuccess(classAnalyticsService.predictRisk(classId)));
    }
}
