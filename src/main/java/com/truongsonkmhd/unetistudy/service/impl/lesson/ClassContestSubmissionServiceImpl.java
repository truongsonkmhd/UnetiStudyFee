package com.truongsonkmhd.unetistudy.service.impl.lesson;

import com.truongsonkmhd.unetistudy.dto.contest_lesson.*;
import com.truongsonkmhd.unetistudy.exception.custom_exception.ResourceNotFoundException;
import com.truongsonkmhd.unetistudy.model.User;
import com.truongsonkmhd.unetistudy.model.lesson.CodingSubmission;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.*;
import com.truongsonkmhd.unetistudy.model.quiz.Answer;
import com.truongsonkmhd.unetistudy.model.quiz.Question;
import com.truongsonkmhd.unetistudy.model.quiz.Quiz;
import com.truongsonkmhd.unetistudy.repository.UserRepository;
import com.truongsonkmhd.unetistudy.repository.clazz.ClassContestRepository;
import com.truongsonkmhd.unetistudy.repository.clazz.ClassContestSubmissionRepository;
import com.truongsonkmhd.unetistudy.repository.coding.CodingSubmissionRepository;
import com.truongsonkmhd.unetistudy.service.ClassContestSubmissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClassContestSubmissionServiceImpl implements ClassContestSubmissionService {

    private final ClassContestSubmissionRepository submissionRepository;
    private final ClassContestRepository classContestRepository;
    private final UserRepository userRepository;
    private final CodingSubmissionRepository codingSubmissionRepository;

    // ─── Start ────────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ContestSessionResponse startSubmission(UUID userId, UUID classContestId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ClassContest classContest = classContestRepository.findById(classContestId)
                .orElseThrow(() -> new ResourceNotFoundException("Class contest not found"));

        // Kiểm tra xem đã có submission đang diễn ra chưa
        Optional<ClassContestSubmission> activeSub =
                submissionRepository.findByUserAndClassContestAndStatus(user, classContest, "IN_PROGRESS");
        if (activeSub.isPresent()) {
            return mapToSessionResponse(activeSub.get());
        }

        // Kiểm tra số lần thử
        long attemptCount = submissionRepository.countByUserAndClassContest(user, classContest);
        if (classContest.getEffectiveMaxAttempts() != null
                && attemptCount >= classContest.getEffectiveMaxAttempts()) {
            throw new IllegalStateException("Bạn đã hết số lần thử cho bài thi này.");
        }

        // Kiểm tra thời gian
        Instant now = Instant.now();
        if (now.isBefore(classContest.getScheduledStartTime())) {
            throw new IllegalStateException("Bài thi chưa bắt đầu.");
        }
        if (now.isAfter(classContest.getScheduledEndTime())) {
            throw new IllegalStateException("Bài thi đã kết thúc.");
        }

        // Tạo submission mới
        ClassContestSubmission submission = ClassContestSubmission.builder()
                .user(user)
                .classContest(classContest)
                .startedAt(now)
                .status("IN_PROGRESS")
                .build();

        submission = submissionRepository.save(submission);
        return mapToSessionResponse(submission);
    }

    // ─── Get current session ──────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public ContestSessionResponse getCurrentSession(UUID userId, UUID classContestId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ClassContest classContest = classContestRepository.findById(classContestId)
                .orElseThrow(() -> new ResourceNotFoundException("Class contest not found"));

        Optional<ClassContestSubmission> activeSub = submissionRepository
                .findByUserAndClassContestAndStatus(user, classContest, "IN_PROGRESS");

        if (activeSub.isPresent()) {
            return mapToSessionResponse(activeSub.get());
        }

        // Không có session đang diễn ra → kiểm tra lý do
        long attemptCount = submissionRepository.countByUserAndClassContest(user, classContest);
        if (classContest.getEffectiveMaxAttempts() != null
                && attemptCount >= classContest.getEffectiveMaxAttempts()) {
            throw new IllegalStateException("Bạn đã hết số lượt làm bài cho bài thi này. (Đã làm "
                    + attemptCount + "/" + classContest.getEffectiveMaxAttempts() + " lượt)");
        }

        throw new ResourceNotFoundException("Không có phiên làm bài nào đang diễn ra. Hãy bắt đầu bài thi mới.");
    }

    // ─── Submit ───────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ContestSubmissionResult submit(UUID submissionId, ContestSubmissionRequest request) {
        ClassContestSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));

        if (!"IN_PROGRESS".equals(submission.getStatus())) {
            throw new IllegalStateException("Phiên làm bài đã kết thúc hoặc không hợp lệ.");
        }

        ClassContest cc = submission.getClassContest();
        ContestLesson cl = cc.getContestLesson();
        UUID userId = submission.getUser().getId();

        // ── 1. Chấm điểm Quiz ─────────────────────────────────────────────────────
        double quizScore = gradeQuiz(cl, request.getQuizAnswers());
        log.info("Contest quiz graded: submissionId={}, quizScore={}", submissionId, quizScore);

        // ── 2. Chấm điểm Coding (lấy điểm cao nhất từ CodingSubmission đã judge) ─
        double codingScore = gradeCoding(cl, userId);
        log.info("Contest coding graded: submissionId={}, codingScore={}", submissionId, codingScore);

        // ── 3. Tính tổng điểm và trạng thái pass/fail ─────────────────────────────
        double totalScore = quizScore + codingScore;
        Integer passingScore = cc.getEffectivePassingScore();
        Integer totalMaxPoints = cl.getTotalPoints();

        double scorePercent = (totalMaxPoints != null && totalMaxPoints > 0)
                ? (totalScore / totalMaxPoints) * 100.0
                : 0.0;

        boolean isPassed = passingScore == null || scorePercent >= passingScore;

        // ── 4. Cập nhật submission ─────────────────────────────────────────────────
        submission.setSubmittedAt(Instant.now());
        submission.setStatus("SUBMITTED");
        submission.setTotalScore(totalScore);
        submission.setIsPassed(isPassed);

        submissionRepository.save(submission);

        log.info("Contest submitted: submissionId={}, quiz={}, coding={}, total={}/{} ({}%), passed={}",
                submissionId, quizScore, codingScore, totalScore, totalMaxPoints,
                String.format("%.1f", scorePercent), isPassed);

        // ── 5. Trả kết quả chi tiết ──────────────────────────────────────────────
        return ContestSubmissionResult.builder()
                .submissionId(submissionId.toString())
                .quizScore(quizScore)
                .codingScore(codingScore)
                .totalScore(totalScore)
                .maxScore(totalMaxPoints != null ? totalMaxPoints : 0)
                .passed(isPassed)
                .message(isPassed ? "Chúc mừng! Bạn đã vượt qua bài thi." : "Bạn chưa đạt yêu cầu. Hãy thử lại!")
                .build();
    }

    // ─── Helper: Chấm điểm Quiz ──────────────────────────────────────────────────

    private double gradeQuiz(ContestLesson cl, Map<UUID, List<UUID>> quizAnswers) {
        if (quizAnswers == null || quizAnswers.isEmpty()) return 0.0;

        double score = 0.0;
        for (Quiz quiz : cl.getQuizzes()) {
            for (Question question : quiz.getQuestions()) {
                List<UUID> selectedAnswerIds = quizAnswers.get(question.getId());
                if (selectedAnswerIds == null || selectedAnswerIds.isEmpty()) continue;

                Set<UUID> correctAnswerIds = question.getAnswers().stream()
                        .filter(Answer::getIsCorrect)
                        .map(Answer::getId)
                        .collect(Collectors.toSet());

                Set<UUID> selectedSet = new HashSet<>(selectedAnswerIds);

                if (correctAnswerIds.equals(selectedSet)) {
                    score += question.getPoints() != null ? question.getPoints().doubleValue() : 0.0;
                }
            }
        }
        return score;
    }

    // ─── Helper: Chấm điểm Coding (tra cứu điểm tốt nhất từ CodingSubmission) ───

    private double gradeCoding(ContestLesson cl, UUID userId) {
        double score = 0.0;
        for (CodingExercise exercise : cl.getCodingExercises()) {
            UUID exerciseId = exercise.getExerciseId();
            // Tìm bài nộp có điểm cao nhất của user cho exercise này
            List<CodingSubmission> submissions = codingSubmissionRepository
                    .findBestByUserAndExercise(userId, exerciseId);

            if (!submissions.isEmpty()) {
                CodingSubmission best = submissions.get(0); // đã sort DESC theo score
                int bestScore = best.getScore() != null ? best.getScore() : 0;
                score += bestScore;
                log.info("Coding exercise={}, bestScore={}, verdict={}, passed={}/{}",
                        exerciseId, bestScore, best.getVerdict(),
                        best.getPassedTestcases(), best.getTotalTestcases());
            } else {
                log.info("Coding exercise={}: no submission found, score=0", exerciseId);
            }
        }
        return score;
    }

    // ─── Map to session response ──────────────────────────────────────────────────

    private ContestSessionResponse mapToSessionResponse(ClassContestSubmission sub) {
        ClassContest cc = sub.getClassContest();
        ContestLesson cl = cc.getContestLesson();
        Instant now = Instant.now();

        long timeLeftSeconds = Duration.between(now, cc.getScheduledEndTime()).getSeconds();
        if (timeLeftSeconds < 0) timeLeftSeconds = 0;

        List<ContestItemDTO> items = new ArrayList<>();

        // Map Coding Exercises
        for (CodingExercise ce : cl.getCodingExercises()) {
            items.add(ContestItemDTO.builder()
                    .id(ce.getExerciseId())
                    .type("CODING")
                    .title(ce.getTitle())
                    .content(ce.getDescription())
                    .points(ce.getPoints())
                    .programmingLanguage(ce.getProgrammingLanguage())
                    .initialCode(ce.getInitialCode())
                    .slug(ce.getSlug())
                    .build());
        }

        // Map Quiz Questions (flatten)
        for (Quiz quiz : cl.getQuizzes()) {
            for (Question q : quiz.getQuestions()) {
                items.add(ContestItemDTO.builder()
                        .id(q.getId())
                        .type("QUIZ")
                        .title(q.getContent())
                        .content(q.getContent())
                        .points(q.getPoints() != null ? q.getPoints().intValue() : 0)
                        .options(q.getAnswers().stream()
                                .map(a -> QuizOptionDTO.builder()
                                        .id(a.getId())
                                        .text(a.getContent())
                                        .build())
                                .collect(Collectors.toList()))
                        .build());
            }
        }

        // Shuffle để tránh học thuộc vị trí
        Collections.shuffle(items);

        return ContestSessionResponse.builder()
                .submissionId(sub.getSubmissionId())
                .classContestId(cc.getClassContestId())
                .title(cl.getTitle())
                .description(cl.getDescription())
                .startTime(cc.getScheduledStartTime())
                .endTime(cc.getScheduledEndTime())
                .durationMinutes(cc.getDurationInMinutes())
                .timeLeftSeconds(timeLeftSeconds)
                .status(sub.getStatus())
                .items(items)
                .build();
    }
}
