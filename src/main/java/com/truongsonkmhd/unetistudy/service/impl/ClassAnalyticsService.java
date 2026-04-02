package com.truongsonkmhd.unetistudy.service.impl;

import com.truongsonkmhd.unetistudy.dto.ml_dto.*;
import com.truongsonkmhd.unetistudy.exception.custom_exception.BusinessRuleException;
import com.truongsonkmhd.unetistudy.exception.custom_exception.ResourceNotFoundException;
import com.truongsonkmhd.unetistudy.context.UserContext;
import com.truongsonkmhd.unetistudy.model.User;
import com.truongsonkmhd.unetistudy.model.course.Course;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.Clazz;
import com.truongsonkmhd.unetistudy.repository.clazz.ClassRepository;
import com.truongsonkmhd.unetistudy.repository.coding.CodingSubmissionRepository;
import com.truongsonkmhd.unetistudy.repository.course.CourseEnrollmentRepository;
import com.truongsonkmhd.unetistudy.repository.course.LessonProgressRepository;
import com.truongsonkmhd.unetistudy.repository.quiz.UserQuizAttemptRepository;
import com.truongsonkmhd.unetistudy.security.AuthoritiesConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

import static com.truongsonkmhd.unetistudy.security.SecurityUtils.hasCurrentUserAnyOfAuthorities;

/**
 * Service phân tích học sinh theo phạm vi lớp học (class-scoped).
 * <p>
 * Dữ liệu được lấy THEO TỪNG SINH VIÊN từ KHÓA HỌC MÀ HỌ ĐÃ ENROLL (APPROVED).
 * Không dùng mẫu số chung cho toàn lớp — mỗi sinh viên có completion rate,
 * quiz score, code pass rate riêng tính từ các khóa học họ tham gia.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ClassAnalyticsService {

    // ── Số ngày tối thiểu lớp phải hoạt động mới có đủ dữ liệu để phân tích
    private static final int MIN_DAYS_FOR_ANALYTICS = 3;
    // ── Số ngày mặc định của khóa học khi không có endDate
    private static final double DEFAULT_COURSE_DAYS = 90.0;

    private final ClassRepository classRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final UserQuizAttemptRepository userQuizAttemptRepository;
    private final CodingSubmissionRepository codingSubmissionRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final MlServiceClient mlServiceClient;

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

    // ─────────────────────────────────────────────────────────────
    // FALLBACKS
    // ─────────────────────────────────────────────────────────────

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

        // ── Chỉ instructor của lớp hoặc admin mới được xem analytics ──
        UUID currentUserId = UserContext.getUserID();
        if (currentUserId == null
                || !clazz.getInstructor().getId().equals(currentUserId)
                && !hasCurrentUserAnyOfAuthorities(AuthoritiesConstants.ADMIN, AuthoritiesConstants.SYS_ADMIN)) {
            throw new BusinessRuleException("Bạn không có quyền xem analytics của lớp này");
        }

        // ── Cold Start Guard ──
        Instant now = Instant.now();
        Instant classStart = clazz.getStartDate();
        long classDurationDays = ChronoUnit.DAYS.between(classStart, now);
        if (classDurationDays < MIN_DAYS_FOR_ANALYTICS) {
            throw new BusinessRuleException(
                "Lớp học mới hoạt động được " + classDurationDays + " ngày. " +
                "Cần ít nhất " + MIN_DAYS_FOR_ANALYTICS + " ngày để có đủ dữ liệu phân tích có ý nghĩa. " +
                "Hãy thử lại sau khi học sinh đã có thêm thời gian học."
            );
        }

        // ── Tính expectedProgressRate ──
        double totalCourseDays = clazz.getEndDate() != null
                ? Math.max(1, ChronoUnit.DAYS.between(classStart, clazz.getEndDate()))
                : DEFAULT_COURSE_DAYS;
        double expectedProgressRate = Math.min(1.0, (double) classDurationDays / totalCourseDays);

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

        // ═══════════════════════════════════════════════════════════
        // BƯỚC 1: Xác định sinh viên đã enroll vào khóa học nào (APPROVED)
        //         → Map<studentId, Set<courseId>>
        // ═══════════════════════════════════════════════════════════
        Map<UUID, Set<UUID>> enrolledCoursesPerStudent = buildEnrolledCoursesMap(studentIds, courseIds);

        // ═══════════════════════════════════════════════════════════
        // BƯỚC 2: Số bài của từng khóa học → Map<courseId, totalLessons>
        // ═══════════════════════════════════════════════════════════
        Map<UUID, Long> lessonsPerCourse = toUUIDLongMap(
                lessonProgressRepository.countLessonsPerCourse(courseIds));

        // ═══════════════════════════════════════════════════════════
        // BƯỚC 3: Số bài hoàn thành per (student, course)
        //         → Map<studentId, Map<courseId, completedCount>>
        // ═══════════════════════════════════════════════════════════
        Map<UUID, Map<UUID, Long>> completedPerStudentPerCourse = buildStudentCourseMap(
                lessonProgressRepository.countCompletedPerStudentPerCourse(studentIds, courseIds));

        // ═══════════════════════════════════════════════════════════
        // BƯỚC 4: Ngày cuối truy cập per (student, course)
        //         → Map<studentId, Map<courseId, lastAccessAt>>
        // ═══════════════════════════════════════════════════════════
        Map<UUID, Map<UUID, Instant>> lastAccessPerStudentPerCourse = buildStudentCourseInstantMap(
                lessonProgressRepository.findLastAccessPerStudentPerCourse(studentIds, courseIds));

        // ═══════════════════════════════════════════════════════════
        // BƯỚC 5: Quiz avg score per (student, course) → [avgScore, attemptCount]
        //         → Map<studentId, Map<courseId, double[]>>
        // ═══════════════════════════════════════════════════════════
        Map<UUID, Map<UUID, double[]>> quizPerStudentPerCourse = buildStudentCourseDoubleArrayMap(
                userQuizAttemptRepository.avgQuizScorePerStudentPerCourse(studentIds, courseIds));

        // ═══════════════════════════════════════════════════════════
        // BƯỚC 6: Coding pass rate per (student, course) → [passRate, submitCount]
        //         → Map<studentId, Map<courseId, double[]>>
        // ═══════════════════════════════════════════════════════════
        Map<UUID, Map<UUID, double[]>> codePerStudentPerCourse = buildStudentCourseDoubleArrayMap(
                codingSubmissionRepository.codePassRatePerStudentPerCourse(studentIds, courseIds));

        // ═══════════════════════════════════════════════════════════
        // BƯỚC 7: Tổng hợp per-student metrics (aggregate qua các khóa đã enroll)
        //         → StudentMetrics cho mỗi student
        // ═══════════════════════════════════════════════════════════
        Map<UUID, StudentMetrics> metricsMap = new HashMap<>();
        for (User student : students) {
            UUID uid = student.getId();
            Set<UUID> enrolledCourses = enrolledCoursesPerStudent.getOrDefault(uid, Set.of());

            // Nếu sinh viên chưa enroll khóa nào → metrics rỗng
            if (enrolledCourses.isEmpty()) {
                metricsMap.put(uid, StudentMetrics.empty(classDurationDays));
                continue;
            }

            long totalLessons = 0L;
            long totalCompleted = 0L;
            Instant latestAccess = null;
            double quizScoreSum = 0.0;
            long quizAttemptTotal = 0L;
            int quizCourseCount = 0;
            double codePassSum = 0.0;
            long codeAttemptTotal = 0L;
            int codeCourseCount = 0;

            for (UUID cid : enrolledCourses) {
                // Tổng bài của khóa này
                totalLessons += lessonsPerCourse.getOrDefault(cid, 0L);

                // Bài hoàn thành (student, course)
                Map<UUID, Long> completedByCourse = completedPerStudentPerCourse.getOrDefault(uid, Map.of());
                totalCompleted += completedByCourse.getOrDefault(cid, 0L);

                // Last access (student, course)
                Map<UUID, Instant> accessByCourse = lastAccessPerStudentPerCourse.getOrDefault(uid, Map.of());
                Instant acc = accessByCourse.get(cid);
                if (acc != null && (latestAccess == null || acc.isAfter(latestAccess))) {
                    latestAccess = acc;
                }

                // Quiz (student, course)
                Map<UUID, double[]> quizByCourse = quizPerStudentPerCourse.getOrDefault(uid, Map.of());
                double[] quiz = quizByCourse.get(cid);
                if (quiz != null && quiz[1] > 0) {
                    quizScoreSum += quiz[0];
                    quizAttemptTotal += (long) quiz[1];
                    quizCourseCount++;
                }

                // Coding (student, course)
                Map<UUID, double[]> codeByCourse = codePerStudentPerCourse.getOrDefault(uid, Map.of());
                double[] code = codeByCourse.get(cid);
                if (code != null && code[1] > 0) {
                    codePassSum += code[0];
                    codeAttemptTotal += (long) code[1];
                    codeCourseCount++;
                }
            }

            // Tránh chia 0
            if (totalLessons == 0) totalLessons = 1;
            double completionRate = round((double) totalCompleted / totalLessons);
            double quizAvgScore   = quizCourseCount > 0 ? roundScore(quizScoreSum / quizCourseCount) : 0.0;
            double codePassAvg    = codeCourseCount > 0 ? round(codePassSum / codeCourseCount) : 0.0;

            Instant now2 = Instant.now();
            long gapDays = latestAccess != null
                    ? ChronoUnit.DAYS.between(latestAccess, now2)
                    : Math.min(classDurationDays, 30);

            metricsMap.put(uid, new StudentMetrics(
                    completionRate,
                    (int) Math.min(gapDays, 30),
                    quizAvgScore,
                    (int) quizAttemptTotal,
                    codePassAvg,
                    (int) codeAttemptTotal,
                    enrolledCourses.isEmpty() ? courseIds.get(0) : enrolledCourses.iterator().next()
            ));
        }

        return new ClassContext(students, metricsMap, courseIds, classDurationDays, expectedProgressRate);
    }

    // ─────────────────────────────────────────────────────────────
    // FEATURE BUILDERS
    // ─────────────────────────────────────────────────────────────

    private List<StudentBehavioralFeatureDTO> buildBehavioralFeatures(ClassContext ctx) {
        return ctx.students.stream().map(student -> {
            UUID uid = student.getId();
            StudentMetrics m = ctx.metricsMap.getOrDefault(uid, StudentMetrics.empty(ctx.classDurationDays));

            double quizFailRate = m.quizAttempts > 0
                    ? round(1.0 - m.quizAvgScore / 10.0)
                    : 0.0;

            long timeSpent = (long) (m.completionRate * 3600); // proxy: ~1 giờ/10% hoàn thành
            int activeDays = (int) Math.max(0, 7 - m.gapDays);

            return StudentBehavioralFeatureDTO.builder()
                    .userId(uid.toString())
                    .courseId(m.representCourseId.toString())
                    .completionRate(m.completionRate)
                    .avgWatchedPercent(m.completionRate)
                    .timeSpentTotal((int) timeSpent)
                    .activeDays7(Math.min(7, activeDays))
                    .lastAccessGapDays(m.gapDays)
                    .quizFailRate(quizFailRate)
                    .build();
        }).toList();
    }

    private List<StudentPerformanceFeatureDTO> buildPerformanceFeatures(ClassContext ctx) {
        return ctx.students.stream().map(student -> {
            UUID uid = student.getId();
            StudentMetrics m = ctx.metricsMap.getOrDefault(uid, StudentMetrics.empty(ctx.classDurationDays));

            double quizFailRate = m.quizAttempts > 0
                    ? round(1.0 - m.quizAvgScore / 10.0)
                    : 0.0;

            return StudentPerformanceFeatureDTO.builder()
                    .userId(uid.toString())
                    .courseId(m.representCourseId.toString())
                    .quizAvgScore(m.quizAvgScore)
                    .quizFailRate(quizFailRate)
                    .codingAcRate(m.codePassAvg)
                    .avgRuntimeMs(0.0)
                    .attemptCount(m.quizAttempts + m.codeAttempts)
                    .build();
        }).toList();
    }

    private List<StudentRiskFeatureDTO> buildRiskFeatures(ClassContext ctx) {
        return ctx.students.stream().map(student -> {
            UUID uid = student.getId();
            StudentMetrics m = ctx.metricsMap.getOrDefault(uid, StudentMetrics.empty(ctx.classDurationDays));

            long timeSpent = (long) (m.completionRate * 3600);

            return StudentRiskFeatureDTO.builder()
                    .userId(uid.toString())
                    .courseId(m.representCourseId.toString())
                    .lessonCompletedRatio(m.completionRate)
                    .totalTimeSpent((int) timeSpent)
                    .quizAvg(m.quizAvgScore)
                    .quizAttempts(m.quizAttempts)
                    .codePassAvg(m.codePassAvg)
                    .codeAttempts(m.codeAttempts)
                    .daysSinceLastAccess(m.gapDays)
                    .build();
        }).toList();
    }

    // ─────────────────────────────────────────────────────────────
    // ENRICH USER INFO
    // ─────────────────────────────────────────────────────────────

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
    // MAP BUILDERS
    // ─────────────────────────────────────────────────────────────

    /**
     * Map<studentId, Set<courseId>> — khóa học đã enroll (APPROVED)
     */
    private Map<UUID, Set<UUID>> buildEnrolledCoursesMap(List<UUID> studentIds, List<UUID> courseIds) {
        List<Object[]> rows = courseEnrollmentRepository.findEnrolledCoursesByStudents(studentIds, courseIds);
        Map<UUID, Set<UUID>> result = new HashMap<>();
        for (Object[] row : rows) {
            UUID studentId = (UUID) row[0];
            UUID courseId  = (UUID) row[1];
            result.computeIfAbsent(studentId, k -> new HashSet<>()).add(courseId);
        }
        return result;
    }

    /**
     * Map<studentId, Map<courseId, longValue>>
     * Input rows: [studentId, courseId, longValue]
     */
    private Map<UUID, Map<UUID, Long>> buildStudentCourseMap(List<Object[]> rows) {
        Map<UUID, Map<UUID, Long>> result = new HashMap<>();
        for (Object[] row : rows) {
            UUID studentId = (UUID) row[0];
            UUID courseId  = (UUID) row[1];
            long value     = row[2] != null ? ((Number) row[2]).longValue() : 0L;
            result.computeIfAbsent(studentId, k -> new HashMap<>()).put(courseId, value);
        }
        return result;
    }

    /**
     * Map<studentId, Map<courseId, Instant>>
     * Input rows: [studentId, courseId, instant]
     */
    private Map<UUID, Map<UUID, Instant>> buildStudentCourseInstantMap(List<Object[]> rows) {
        Map<UUID, Map<UUID, Instant>> result = new HashMap<>();
        for (Object[] row : rows) {
            UUID studentId = (UUID) row[0];
            UUID courseId  = (UUID) row[1];
            Instant value  = row[2] != null ? (Instant) row[2] : null;
            if (value != null) {
                result.computeIfAbsent(studentId, k -> new HashMap<>()).put(courseId, value);
            }
        }
        return result;
    }

    /**
     * Map<studentId, Map<courseId, double[]>>
     * Input rows: [studentId, courseId, val1, val2]
     */
    private Map<UUID, Map<UUID, double[]>> buildStudentCourseDoubleArrayMap(List<Object[]> rows) {
        Map<UUID, Map<UUID, double[]>> result = new HashMap<>();
        for (Object[] row : rows) {
            UUID studentId = (UUID) row[0];
            UUID courseId  = (UUID) row[1];
            double v1 = row[2] != null ? ((Number) row[2]).doubleValue() : 0.0;
            double v2 = row[3] != null ? ((Number) row[3]).doubleValue() : 0.0;
            result.computeIfAbsent(studentId, k -> new HashMap<>()).put(courseId, new double[]{v1, v2});
        }
        return result;
    }

    /** Map<courseId, longValue> từ rows [courseId, longValue] */
    private Map<UUID, Long> toUUIDLongMap(List<Object[]> rows) {
        return rows.stream().collect(Collectors.toMap(
                r -> (UUID) r[0],
                r -> ((Number) r[1]).longValue()
        ));
    }

    // ─────────────────────────────────────────────────────────────
    // ROUND UTILS
    // ─────────────────────────────────────────────────────────────

    /** Giữ giá trị 0–1 (tỷ lệ, rate) */
    private double round(double v) {
        return Math.max(0, Math.min(1, Math.round(v * 100.0) / 100.0));
    }

    /** Giữ giá trị 0–10 (thang điểm quiz) */
    private double roundScore(double v) {
        return Math.max(0, Math.min(10, Math.round(v * 100.0) / 100.0));
    }

    // ─────────────────────────────────────────────────────────────
    // INNER RECORDS
    // ─────────────────────────────────────────────────────────────

    /**
     * Metrics đã tổng hợp của 1 sinh viên (aggregate từ các khóa học đã enroll).
     */
    private record StudentMetrics(
            double completionRate,    // 0.0–1.0
            int    gapDays,           // số ngày kể từ lần truy cập cuối
            double quizAvgScore,      // 0.0–10.0
            int    quizAttempts,      // tổng số lần làm quiz
            double codePassAvg,       // 0.0–1.0
            int    codeAttempts,      // tổng số lần submit code
            UUID   representCourseId  // courseId đại diện để gửi lên ML
    ) {
        static StudentMetrics empty(long classDurationDays) {
            return new StudentMetrics(0.0, (int) Math.min(classDurationDays, 30), 0.0, 0, 0.0, 0,
                    UUID.fromString("00000000-0000-0000-0000-000000000000"));
        }
    }

    /**
     * Context holder cho một request analytics.
     */
    private record ClassContext(
            Set<User>                students,
            Map<UUID, StudentMetrics> metricsMap,
            List<UUID>               courseIds,
            long                     classDurationDays,
            double                   expectedProgressRate
    ) {}
}
