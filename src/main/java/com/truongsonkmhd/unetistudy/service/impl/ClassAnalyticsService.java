package com.truongsonkmhd.unetistudy.service.impl;

import com.truongsonkmhd.unetistudy.dto.ml_dto.*;
import com.truongsonkmhd.unetistudy.exception.custom_exception.BusinessRuleException;
import com.truongsonkmhd.unetistudy.exception.custom_exception.ResourceNotFoundException;
import com.truongsonkmhd.unetistudy.context.UserContext;
import com.truongsonkmhd.unetistudy.model.User;
import com.truongsonkmhd.unetistudy.model.course.Course;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.Clazz;
import com.truongsonkmhd.unetistudy.repository.UserRepository;
import com.truongsonkmhd.unetistudy.repository.clazz.ClassRepository;
import com.truongsonkmhd.unetistudy.repository.coding.CodingSubmissionRepository;
import com.truongsonkmhd.unetistudy.repository.course.LessonProgressRepository;
import com.truongsonkmhd.unetistudy.repository.quiz.UserQuizAttemptRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service phân tích học sinh theo phạm vi lớp học (class-scoped).
 * Dữ liệu được lấy thực từ DB (LessonProgress, UserQuizAttempt, CodingSubmission).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ClassAnalyticsService {

    private final ClassRepository classRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final UserQuizAttemptRepository userQuizAttemptRepository;
    private final CodingSubmissionRepository codingSubmissionRepository;
    private final MlServiceClient mlServiceClient;
    private final UserRepository userRepository;

    // ─────────────────────────────────────────────────────────────
    // PUBLIC API — 4 loại analytics theo classId
    // ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ClusterResponseDTO clusterBehavioral(UUID classId) {
        ClassContext ctx = loadClassContext(classId);
        List<StudentBehavioralFeatureDTO> features = buildBehavioralFeatures(ctx);
        log.info("[ClassAnalytics] Behavioral clustering classId={}, students={}", classId, features.size());
        try {
            ClusterResponseDTO result = mlServiceClient.cluster(ClusterRequestDTO.builder()
                    .clusterType("BEHAVIORAL").students(features).build());
            return enrichWithUserInfo(result, ctx.students);
        } catch (Exception e) {
            log.error("[ClassAnalytics] ML Service unavailable for BEHAVIORAL: {}", e.getMessage());
            return fallbackCluster("BEHAVIORAL", ctx.students, "ML Service đang khởi động, vui lòng thử lại");
        }
    }

    @Transactional(readOnly = true)
    public ClusterResponseDTO clusterPerformance(UUID classId) {
        ClassContext ctx = loadClassContext(classId);
        List<StudentPerformanceFeatureDTO> features = buildPerformanceFeatures(ctx);
        log.info("[ClassAnalytics] Performance clustering classId={}, students={}", classId, features.size());
        try {
            ClusterResponseDTO result = mlServiceClient.cluster(ClusterRequestDTO.builder()
                    .clusterType("PERFORMANCE").students(features).build());
            return enrichWithUserInfo(result, ctx.students);
        } catch (Exception e) {
            log.error("[ClassAnalytics] ML Service unavailable for PERFORMANCE: {}", e.getMessage());
            return fallbackCluster("PERFORMANCE", ctx.students, "ML Service đang khởi động, vui lòng thử lại");
        }
    }

    @Transactional(readOnly = true)
    public ClusterResponseDTO clusterRisk(UUID classId) {
        ClassContext ctx = loadClassContext(classId);
        List<StudentBehavioralFeatureDTO> features = buildBehavioralFeatures(ctx);
        log.info("[ClassAnalytics] Risk clustering classId={}, students={}", classId, features.size());
        try {
            ClusterResponseDTO result = mlServiceClient.cluster(ClusterRequestDTO.builder()
                    .clusterType("RISK").students(features).build());
            return enrichWithUserInfo(result, ctx.students);
        } catch (Exception e) {
            log.error("[ClassAnalytics] ML Service unavailable for RISK cluster: {}", e.getMessage());
            return fallbackCluster("RISK", ctx.students, "ML Service đang khởi động, vui lòng thử lại");
        }
    }

    @Transactional(readOnly = true)
    public RiskPredictionResponseDTO predictRisk(UUID classId) {
        ClassContext ctx = loadClassContext(classId);
        List<StudentRiskFeatureDTO> features = buildRiskFeatures(ctx);
        log.info("[ClassAnalytics] Risk prediction classId={}, students={}", classId, features.size());
        try {
            return mlServiceClient.predictRisk(RiskPredictionRequestDTO.builder()
                    .students(features).build());
        } catch (Exception e) {
            log.error("[ClassAnalytics] ML Service unavailable for RISK predict: {}", e.getMessage());
            return fallbackRisk(ctx.students);
        }
    }

    /**
     * Fallback khi ML Service không khả dụng: trả về dữ liệu rỗng với thông tin user.
     */
    private ClusterResponseDTO fallbackCluster(String clusterType, Set<User> students, String reason) {
        List<StudentClusterResultDTO> results = students.stream().map(u -> {
            StudentClusterResultDTO r = new StudentClusterResultDTO();
            r.setUserId(u.getId().toString());
            r.setFullName(u.getFullName());
            r.setUsername(u.getUsername());
            r.setAvatar(u.getAvatar());
            r.setClusterId(-1);
            r.setClusterLabel("Chưa có dữ liệu");
            r.setClusterScore(0.0);
            return r;
        }).collect(Collectors.toList());

        ClusterResponseDTO fallback = new ClusterResponseDTO();
        fallback.setClusterType(clusterType);
        fallback.setResults(results);
        fallback.setClusterSummary(Map.of("Chưa có dữ liệu", students.size()));
        return fallback;
    }

    private RiskPredictionResponseDTO fallbackRisk(Set<User> students) {
        RiskPredictionResponseDTO fallback = new RiskPredictionResponseDTO();
        fallback.setResults(List.of());
        return fallback;
    }

    // ─────────────────────────────────────────────────────────────
    // LOAD CLASS CONTEXT
    // ─────────────────────────────────────────────────────────────

    private ClassContext loadClassContext(UUID classId) {
        Clazz clazz = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp học: " + classId));

        // ---- Chỉ instructor của lớp mới được xem analytics ----
        UUID currentUserId = UserContext.getUserID();
        if (currentUserId == null || !clazz.getInstructor().getId().equals(currentUserId)) {
            throw new BusinessRuleException("Bạn không có quyền xem analytics của lớp này");
        }

        Set<Course> courses = clazz.getRequiredCourses();
        if (courses.isEmpty()) {
            throw new BusinessRuleException("Lớp học chưa được gán khóa học nào. Vui lòng gán ít nhất 1 khóa học trước khi chạy analytics.");
        }

        Set<User> students = clazz.getStudents();
        if (students.isEmpty()) {
            throw new BusinessRuleException("Lớp học chưa có học sinh nào.");
        }

        List<UUID> studentIds = students.stream().map(User::getId).toList();
        List<UUID> courseIds  = courses.stream().map(Course::getCourseId).toList();

        // ── Load aggregated metrics từ DB ──
        // 1. Tổng số lessons trong các khóa học
        long totalLessons = Optional.ofNullable(
                lessonProgressRepository.countTotalLessonsByCourses(courseIds)).orElse(1L);
        if (totalLessons == 0) totalLessons = 1;

        // 2. Bài hoàn thành: {studentId → completedCount}
        Map<UUID, Long> completedMap = toUUIDLongMap(
                lessonProgressRepository.countCompletedByStudentsAndCourses(studentIds, courseIds));

        // 3. Ngày cuối truy cập: {studentId → lastAccessAt}
        Map<UUID, Instant> lastAccessMap = toUUIDInstantMap(
                lessonProgressRepository.findLastAccessByStudents(studentIds, courseIds));

        // 4. Quiz: {studentId → [avgScore, attemptCount]}
        Map<UUID, double[]> quizMap = toUUIDDoubleArrayMap(
                userQuizAttemptRepository.avgQuizScoreByStudents(studentIds, courseIds));

        // 5. Coding: {studentId → [passRate, submitCount]}
        Map<UUID, double[]> codeMap = toUUIDDoubleArrayMap(
                codingSubmissionRepository.codePassRateByStudents(studentIds, courseIds));

        return new ClassContext(students, totalLessons, completedMap, lastAccessMap, quizMap, codeMap, courseIds);
    }

    // ─────────────────────────────────────────────────────────────
    // FEATURE BUILDERS
    // ─────────────────────────────────────────────────────────────

    private List<StudentBehavioralFeatureDTO> buildBehavioralFeatures(ClassContext ctx) {
        Instant now = Instant.now();
        return ctx.students.stream().map(student -> {
            UUID uid = student.getId();
            long completed  = ctx.completedMap.getOrDefault(uid, 0L);
            double compRate = round((double) completed / ctx.totalLessons);

            Instant lastAccess = ctx.lastAccessMap.get(uid);
            long gapDays = lastAccess != null
                    ? ChronoUnit.DAYS.between(lastAccess, now) : 30;

            double[] quiz = ctx.quizMap.getOrDefault(uid, new double[]{0, 0});
            double[] code = ctx.codeMap.getOrDefault(uid, new double[]{0, 0});

            // Ước tính time_spent từ số bài hoàn thành (fallback khi không có log trực tiếp)
            long timeSpent = completed * 600L; // ~10 phút/bài
            // active_days_7: ước tính từ gap—nếu gapDays <= 7 coi như active thường xuyên
            int activeDays = (int) Math.max(0, 7 - gapDays);

            return StudentBehavioralFeatureDTO.builder()
                    .userId(uid.toString())
                    .courseId(ctx.courseIds.get(0).toString()) // đại diện
                    .completionRate(compRate)
                    .avgWatchedPercent(compRate) // proxy
                    .timeSpentTotal((int) timeSpent)
                    .activeDays7(Math.min(7, activeDays))
                    .lastAccessGapDays((int) Math.min(gapDays, 30))
                    .build();
        }).toList();
    }

    private List<StudentPerformanceFeatureDTO> buildPerformanceFeatures(ClassContext ctx) {
        return ctx.students.stream().map(student -> {
            UUID uid = student.getId();
            double[] quiz = ctx.quizMap.getOrDefault(uid, new double[]{0, 0});
            double[] code = ctx.codeMap.getOrDefault(uid, new double[]{0, 0});
            double quizAvg  = quiz[0];   // 0.0–10.0
            long quizCount  = (long) quiz[1];
            double codeRate = code[0];   // 0.0–1.0
            long codeCount  = (long) code[1];
            // failRate = 1 - normalised_quiz_score (được tính trên thang 0–1)
            double quizFailRate = quizCount > 0 ? round(1.0 - quizAvg / 10.0) : 1.0;

            return StudentPerformanceFeatureDTO.builder()
                    .userId(uid.toString())
                    .courseId(ctx.courseIds.get(0).toString())
                    .quizAvgScore(roundScore(quizAvg))      // giữ thang 0–10
                    .quizFailRate(round(quizFailRate))       // 0–1
                    .codingAcRate(round(codeRate))           // 0–1
                    .avgRuntimeMs(0.0)
                    .attemptCount((int)(quizCount + codeCount))
                    .build();
        }).toList();
    }

    private List<StudentRiskFeatureDTO> buildRiskFeatures(ClassContext ctx) {
        Instant now = Instant.now();
        return ctx.students.stream().map(student -> {
            UUID uid = student.getId();
            long completed  = ctx.completedMap.getOrDefault(uid, 0L);
            double compRate = round((double) completed / ctx.totalLessons);

            Instant lastAccess = ctx.lastAccessMap.get(uid);
            int gapDays = (int) (lastAccess != null
                    ? ChronoUnit.DAYS.between(lastAccess, now) : 30);

            double[] quiz = ctx.quizMap.getOrDefault(uid, new double[]{0, 0});
            double[] code = ctx.codeMap.getOrDefault(uid, new double[]{0, 0});

            return StudentRiskFeatureDTO.builder()
                    .userId(uid.toString())
                    .courseId(ctx.courseIds.get(0).toString())
                    .lessonCompletedRatio(round(compRate))      // 0–1
                    .totalTimeSpent((int)(completed * 600))
                    .quizAvg(roundScore(quiz[0]))               // giữ thang 0–10
                    .quizAttempts((int) quiz[1])
                    .codePassAvg(round(code[0]))                // 0–1
                    .codeAttempts((int) code[1])
                    .daysSinceLastAccess(Math.min(gapDays, 30))
                    .build();
        }).toList();
    }

    // ─────────────────────────────────────────────────────────────
    // ENRICH USER INFO
    // ─────────────────────────────────────────────────────────────

    /**
     * Thêm fullName, username, avatar vào từng StudentClusterResultDTO
     * dựa trên userId từ kết quả ML.
     */
    private ClusterResponseDTO enrichWithUserInfo(ClusterResponseDTO response, Set<User> students) {
        if (response == null || response.getResults() == null) return response;
        Map<String, User> userMap = students.stream()
                .collect(Collectors.toMap(u -> u.getId().toString(), u -> u));
        response.getResults().forEach(r -> {
            User u = userMap.get(r.getUserId());
            if (u != null) {
                r.setFullName(u.getFullName());
                r.setUsername(u.getUsername());
                r.setAvatar(u.getAvatar());
            }
        });
        return response;
    }

    // ─────────────────────────────────────────────────────────────
    // UTILS
    // ─────────────────────────────────────────────────────────────

    private Map<UUID, Long> toUUIDLongMap(List<Object[]> rows) {
        return rows.stream().collect(Collectors.toMap(
                r -> (UUID) r[0],
                r -> ((Number) r[1]).longValue()
        ));
    }

    private Map<UUID, Instant> toUUIDInstantMap(List<Object[]> rows) {
        return rows.stream().collect(Collectors.toMap(
                r -> (UUID) r[0],
                r -> (Instant) r[1]
        ));
    }

    private Map<UUID, double[]> toUUIDDoubleArrayMap(List<Object[]> rows) {
        return rows.stream().collect(Collectors.toMap(
                r -> (UUID) r[0],
                r -> new double[]{
                        r[1] != null ? ((Number) r[1]).doubleValue() : 0.0,
                        r[2] != null ? ((Number) r[2]).doubleValue() : 0.0
                }
        ));
    }

    /** Giữ giá trị 0–1 (tỷ lệ, rate) */
    private double round(double v) {
        return Math.max(0, Math.min(1, Math.round(v * 100.0) / 100.0));
    }

    /** Giữ giá trị 0–10 (thang điểm quiz) */
    private double roundScore(double v) {
        return Math.max(0, Math.min(10, Math.round(v * 100.0) / 100.0));
    }

    // ─────────────────────────────────────────────────────────────
    // INNER CLASS — context holder
    // ─────────────────────────────────────────────────────────────

    private record ClassContext(
            Set<User> students,
            long totalLessons,
            Map<UUID, Long> completedMap,
            Map<UUID, Instant> lastAccessMap,
            Map<UUID, double[]> quizMap,
            Map<UUID, double[]> codeMap,
            List<UUID> courseIds
    ) {}
}
