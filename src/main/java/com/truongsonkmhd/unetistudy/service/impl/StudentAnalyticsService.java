package com.truongsonkmhd.unetistudy.service.impl;

import com.truongsonkmhd.unetistudy.dto.ml_dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Service phân tích học sinh — hiện dùng FAKE DATA để test.
 * Khi deploy thực tế, thay thế các phương thức buildFake*() bằng query từ DB.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StudentAnalyticsService {

    private final MlServiceClient mlServiceClient;

    private static final int FAKE_STUDENT_COUNT = 250;
    private static final String FAKE_COURSE_ID = "course-java-advanced-001";

    // ─────────────────────────────────────────────────────────────
    // PUBLIC API
    // ─────────────────────────────────────────────────────────────

    /** Phân nhóm học sinh theo hành vi học tập */
    public ClusterResponseDTO clusterBehavioral(String courseId) {
        List<StudentBehavioralFeatureDTO> students = buildFakeBehavioralData(courseId);
        log.info("[Analytics] Behavioral clustering: {} students, course={}", students.size(), courseId);
        ClusterRequestDTO req = ClusterRequestDTO.builder()
                .clusterType("BEHAVIORAL")
                .students(students)
                .build();
        return mlServiceClient.cluster(req);
    }

    /** Phân nhóm học sinh theo năng lực (quiz + coding) */
    public ClusterResponseDTO clusterPerformance(String courseId) {
        List<StudentPerformanceFeatureDTO> students = buildFakePerformanceData(courseId);
        log.info("[Analytics] Performance clustering: {} students, course={}", students.size(), courseId);
        ClusterRequestDTO req = ClusterRequestDTO.builder()
                .clusterType("PERFORMANCE")
                .students(students)
                .build();
        return mlServiceClient.cluster(req);
    }

    /** Phân nhóm học sinh theo nguy cơ bỏ học (KMeans 3 nhóm) */
    public ClusterResponseDTO clusterRisk(String courseId) {
        List<StudentBehavioralFeatureDTO> students = buildFakeBehavioralData(courseId);
        log.info("[Analytics] Risk clustering: {} students, course={}", students.size(), courseId);
        ClusterRequestDTO req = ClusterRequestDTO.builder()
                .clusterType("RISK")
                .students(students)
                .build();
        return mlServiceClient.cluster(req);
    }

    /** Dự đoán xác suất bỏ học từng học sinh (Random Forest) */
    public RiskPredictionResponseDTO predictDropoutRisk(String courseId) {
        List<StudentRiskFeatureDTO> students = buildFakeRiskData(courseId);
        log.info("[Analytics] Risk prediction: {} students, course={}", students.size(), courseId);
        return mlServiceClient.predictRisk(
                RiskPredictionRequestDTO.builder().students(students).build()
        );
    }

    // ─────────────────────────────────────────────────────────────
    // FAKE DATA GENERATORS  (250 records mỗi loại)
    // ─────────────────────────────────────────────────────────────

    /**
     * Tạo 250 bản ghi hành vi học tập đa dạng theo 4 nhóm điển hình:
     * - Nhóm A (Chăm & Tiến độ tốt)   ~30%: completion cao, active nhiều, gap nhỏ
     * - Nhóm B (Chậm nhưng Kiên trì)  ~25%: completion thấp, time cao, gap vừa
     * - Nhóm C (Lười học)             ~25%: completion thấp, time thấp, gap lớn
     * - Nhóm D (Học Bù Đột Xuất)      ~20%: active_days thấp, nhưng thi thoảng bùng lên
     */
    private List<StudentBehavioralFeatureDTO> buildFakeBehavioralData(String courseId) {
        List<StudentBehavioralFeatureDTO> list = new ArrayList<>();
        Random rng = new Random(42); // seed cố định để reproducible

        String resolvedCourse = (courseId != null && !courseId.isBlank()) ? courseId : FAKE_COURSE_ID;

        // Nhóm A: Chăm & Tiến độ tốt (~75 học sinh)
        for (int i = 1; i <= 75; i++) {
            list.add(StudentBehavioralFeatureDTO.builder()
                    .userId("student-" + String.format("%03d", i))
                    .courseId(resolvedCourse)
                    .completionRate(round(0.75 + rng.nextDouble() * 0.25))         // 0.75–1.00
                    .avgWatchedPercent(round(0.80 + rng.nextDouble() * 0.20))      // 0.80–1.00
                    .timeSpentTotal(4000 + rng.nextInt(4000))                      // 4000–8000s
                    .activeDays7(5 + rng.nextInt(3))                               // 5–7 ngày/tuần
                    .lastAccessGapDays(rng.nextInt(2))                             // 0–1 ngày
                    .build());
        }

        // Nhóm B: Chậm nhưng Kiên trì (~60 học sinh)
        for (int i = 76; i <= 135; i++) {
            list.add(StudentBehavioralFeatureDTO.builder()
                    .userId("student-" + String.format("%03d", i))
                    .courseId(resolvedCourse)
                    .completionRate(round(0.25 + rng.nextDouble() * 0.30))         // 0.25–0.55
                    .avgWatchedPercent(round(0.40 + rng.nextDouble() * 0.35))      // 0.40–0.75
                    .timeSpentTotal(3500 + rng.nextInt(2500))                      // 3500–6000s
                    .activeDays7(3 + rng.nextInt(2))                               // 3–4 ngày/tuần
                    .lastAccessGapDays(3 + rng.nextInt(4))                         // 3–6 ngày
                    .build());
        }

        // Nhóm C: Lười học (~65 học sinh)
        for (int i = 136; i <= 200; i++) {
            list.add(StudentBehavioralFeatureDTO.builder()
                    .userId("student-" + String.format("%03d", i))
                    .courseId(resolvedCourse)
                    .completionRate(round(rng.nextDouble() * 0.20))                // 0.00–0.20
                    .avgWatchedPercent(round(rng.nextDouble() * 0.30))             // 0.00–0.30
                    .timeSpentTotal(200 + rng.nextInt(1000))                       // 200–1200s
                    .activeDays7(rng.nextInt(2))                                    // 0–1 ngày/tuần
                    .lastAccessGapDays(10 + rng.nextInt(20))                       // 10–29 ngày
                    .build());
        }

        // Nhóm D: Học Bù Đột Xuất (~50 học sinh)
        for (int i = 201; i <= 250; i++) {
            list.add(StudentBehavioralFeatureDTO.builder()
                    .userId("student-" + String.format("%03d", i))
                    .courseId(resolvedCourse)
                    .completionRate(round(0.40 + rng.nextDouble() * 0.35))         // 0.40–0.75
                    .avgWatchedPercent(round(0.50 + rng.nextDouble() * 0.30))      // 0.50–0.80
                    .timeSpentTotal(1500 + rng.nextInt(3000))                      // 1500–4500s
                    .activeDays7(rng.nextInt(3))                                    // 0–2 ngày/tuần
                    .lastAccessGapDays(5 + rng.nextInt(8))                         // 5–12 ngày
                    .build());
        }

        return list;
    }

    /**
     * Tạo 250 bản ghi năng lực học tập theo 4 nhóm:
     * - Strong         ~25%: quiz cao + coding cao
     * - Theory Strong  ~25%: quiz cao, coding thấp
     * - Practice Strong~25%: quiz thấp, coding cao
     * - Weak           ~25%: cả hai thấp
     */
    private List<StudentPerformanceFeatureDTO> buildFakePerformanceData(String courseId) {
        List<StudentPerformanceFeatureDTO> list = new ArrayList<>();
        Random rng = new Random(42);

        String resolvedCourse = (courseId != null && !courseId.isBlank()) ? courseId : FAKE_COURSE_ID;

        // Strong (~62 học sinh)
        for (int i = 1; i <= 62; i++) {
            list.add(StudentPerformanceFeatureDTO.builder()
                    .userId("student-" + String.format("%03d", i))
                    .courseId(resolvedCourse)
                    .quizAvgScore(round(7.5 + rng.nextDouble() * 2.5))             // 7.5–10
                    .quizFailRate(round(rng.nextDouble() * 0.15))                   // 0–0.15
                    .codingAcRate(round(0.75 + rng.nextDouble() * 0.25))           // 0.75–1.00
                    .avgRuntimeMs(round(100 + rng.nextDouble() * 200))             // 100–300ms
                    .attemptCount(3 + rng.nextInt(5))                              // 3–7 lần
                    .build());
        }

        // Theory Strong (~63 học sinh)
        for (int i = 63; i <= 125; i++) {
            list.add(StudentPerformanceFeatureDTO.builder()
                    .userId("student-" + String.format("%03d", i))
                    .courseId(resolvedCourse)
                    .quizAvgScore(round(7.0 + rng.nextDouble() * 3.0))             // 7.0–10
                    .quizFailRate(round(rng.nextDouble() * 0.20))                   // 0–0.20
                    .codingAcRate(round(rng.nextDouble() * 0.35))                   // 0.00–0.35
                    .avgRuntimeMs(round(400 + rng.nextDouble() * 600))             // 400–1000ms
                    .attemptCount(5 + rng.nextInt(8))                              // 5–12 lần
                    .build());
        }

        // Practice Strong (~62 học sinh)
        for (int i = 126; i <= 187; i++) {
            list.add(StudentPerformanceFeatureDTO.builder()
                    .userId("student-" + String.format("%03d", i))
                    .courseId(resolvedCourse)
                    .quizAvgScore(round(3.0 + rng.nextDouble() * 3.0))             // 3.0–6.0
                    .quizFailRate(round(0.30 + rng.nextDouble() * 0.40))           // 0.30–0.70
                    .codingAcRate(round(0.70 + rng.nextDouble() * 0.30))           // 0.70–1.00
                    .avgRuntimeMs(round(80 + rng.nextDouble() * 120))              // 80–200ms
                    .attemptCount(2 + rng.nextInt(4))                              // 2–5 lần
                    .build());
        }

        // Weak (~63 học sinh)
        for (int i = 188; i <= 250; i++) {
            list.add(StudentPerformanceFeatureDTO.builder()
                    .userId("student-" + String.format("%03d", i))
                    .courseId(resolvedCourse)
                    .quizAvgScore(round(1.0 + rng.nextDouble() * 4.0))             // 1.0–5.0
                    .quizFailRate(round(0.50 + rng.nextDouble() * 0.50))           // 0.50–1.00
                    .codingAcRate(round(rng.nextDouble() * 0.30))                   // 0.00–0.30
                    .avgRuntimeMs(round(800 + rng.nextDouble() * 1200))            // 800–2000ms
                    .attemptCount(8 + rng.nextInt(12))                             // 8–19 lần
                    .build());
        }

        return list;
    }

    /**
     * Tạo 250 bản ghi risk features:
     * - LOW risk   ~40%: hoàn thành nhiều, nhiều nỗ lực, truy cập gần đây
     * - MEDIUM risk~35%: kết quả trung bình, ít hoạt động
     * - HIGH risk  ~25%: ít hoàn thành, lâu không truy cập, ít nỗ lực
     */
    private List<StudentRiskFeatureDTO> buildFakeRiskData(String courseId) {
        List<StudentRiskFeatureDTO> list = new ArrayList<>();
        Random rng = new Random(42);

        String resolvedCourse = (courseId != null && !courseId.isBlank()) ? courseId : FAKE_COURSE_ID;

        // LOW risk (~100 học sinh)
        for (int i = 1; i <= 100; i++) {
            list.add(StudentRiskFeatureDTO.builder()
                    .userId("student-" + String.format("%03d", i))
                    .courseId(resolvedCourse)
                    .lessonCompletedRatio(round(0.65 + rng.nextDouble() * 0.35))   // 0.65–1.00
                    .totalTimeSpent(3600 + rng.nextInt(7200))                      // 1–3 giờ
                    .quizAvg(round(6.5 + rng.nextDouble() * 3.5))                  // 6.5–10
                    .quizAttempts(2 + rng.nextInt(5))                              // 2–6 lần
                    .codePassAvg(round(0.65 + rng.nextDouble() * 0.35))            // 0.65–1.00
                    .codeAttempts(2 + rng.nextInt(4))                              // 2–5 lần
                    .daysSinceLastAccess(rng.nextInt(3))                           // 0–2 ngày
                    .build());
        }

        // MEDIUM risk (~87 học sinh)
        for (int i = 101; i <= 187; i++) {
            list.add(StudentRiskFeatureDTO.builder()
                    .userId("student-" + String.format("%03d", i))
                    .courseId(resolvedCourse)
                    .lessonCompletedRatio(round(0.30 + rng.nextDouble() * 0.35))   // 0.30–0.65
                    .totalTimeSpent(900 + rng.nextInt(2700))                       // 15–60 phút
                    .quizAvg(round(3.5 + rng.nextDouble() * 3.0))                  // 3.5–6.5
                    .quizAttempts(3 + rng.nextInt(6))                              // 3–8 lần
                    .codePassAvg(round(0.30 + rng.nextDouble() * 0.35))            // 0.30–0.65
                    .codeAttempts(4 + rng.nextInt(6))                              // 4–9 lần
                    .daysSinceLastAccess(4 + rng.nextInt(7))                       // 4–10 ngày
                    .build());
        }

        // HIGH risk (~63 học sinh)
        for (int i = 188; i <= 250; i++) {
            list.add(StudentRiskFeatureDTO.builder()
                    .userId("student-" + String.format("%03d", i))
                    .courseId(resolvedCourse)
                    .lessonCompletedRatio(round(rng.nextDouble() * 0.25))           // 0.00–0.25
                    .totalTimeSpent(rng.nextInt(900))                              // 0–15 phút
                    .quizAvg(round(rng.nextDouble() * 3.5))                        // 0–3.5
                    .quizAttempts(rng.nextInt(2))                                   // 0–1 lần
                    .codePassAvg(round(rng.nextDouble() * 0.25))                   // 0.00–0.25
                    .codeAttempts(rng.nextInt(2))                                   // 0–1 lần
                    .daysSinceLastAccess(14 + rng.nextInt(17))                     // 14–30 ngày
                    .build());
        }

        return list;
    }

    // ─────────────────────────────────────────────────────────────
    // UTILS
    // ─────────────────────────────────────────────────────────────

    private double round(double value) {
        // Làm tròn 2 chữ số thập phân
        return Math.round(value * 100.0) / 100.0;
    }
}
