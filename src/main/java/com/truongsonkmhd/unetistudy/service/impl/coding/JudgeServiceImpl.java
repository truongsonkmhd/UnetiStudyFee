package com.truongsonkmhd.unetistudy.service.impl.coding;

import com.truongsonkmhd.unetistudy.common.ProgressStatus;
import com.truongsonkmhd.unetistudy.common.SubmissionVerdict;
import com.truongsonkmhd.unetistudy.configuration.JudgeRabbitConfig;
import com.truongsonkmhd.unetistudy.context.UserContext;
import com.truongsonkmhd.unetistudy.dto.coding_exercise_dto.JudgeRequestDTO;
import com.truongsonkmhd.unetistudy.dto.coding_exercise_dto.JudgeRunResponseDTO;
import com.truongsonkmhd.unetistudy.dto.coding_submission.CodingSubmissionResponseDTO;
import com.truongsonkmhd.unetistudy.dto.contest_exercise_attempt.AttemptInfoDTO;
import com.truongsonkmhd.unetistudy.dto.exercise_test_cases_dto.ExerciseTestCasesDTO;
import com.truongsonkmhd.unetistudy.mapper.lesson.ExerciseTestCaseMapper;
import com.truongsonkmhd.unetistudy.model.User;
import com.truongsonkmhd.unetistudy.model.lesson.CodingSubmission;
import com.truongsonkmhd.unetistudy.model.lesson.ContestExerciseAttempt;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.CourseLesson;
import com.truongsonkmhd.unetistudy.dto.judge_rabbit_mq.JudgeInternalResult;
import com.truongsonkmhd.unetistudy.dto.progress_dto.LessonProgressRequest;
import com.truongsonkmhd.unetistudy.dto.judge_rabbit_mq.JudgeRunMessage;
import com.truongsonkmhd.unetistudy.dto.judge_rabbit_mq.JudgeSubmitMessage;
import com.truongsonkmhd.unetistudy.repository.coding.ExerciseTestCaseRepository;
import com.truongsonkmhd.unetistudy.service.*;
import com.truongsonkmhd.unetistudy.strategy.coding.LanguageRunner;
import com.truongsonkmhd.unetistudy.strategy.coding.LanguageRunnerFactory;
import com.truongsonkmhd.unetistudy.utils.DockerCodeExecutionUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class JudgeServiceImpl implements JudgeService {
    private final UserService userService;
    private final ExerciseTestCaseMapper exerciseTestCaseMapper;
    private final ExerciseTestCaseRepository exerciseTestCaseRepository;
    private final RabbitTemplate rabbitTemplate;

    private final CodingExerciseService codingExerciseService;
    private final ContestExerciseAttemptService contestExerciseAttemptService;
    private final CourseLessonService lessonService;
    private final DockerCodeExecutionUtil dockerCodeExecutionUtil;
    private final LanguageRunnerFactory runnerFactory;
    private final CodingSubmissionService codingSubmissionService;
    private final LessonProgressService lessonProgressService;

    private static final String ENV_HOST = "JUDGE_WORKDIR_HOST";

    @Override
    public void publishSubmitJob(CodingSubmission saved, JudgeRequestDTO request) {
        JudgeSubmitMessage msg = JudgeSubmitMessage.builder()
                .submissionId(saved.getSubmissionId())
                .exerciseId(saved.getExercise().getExerciseId())
                .userId(saved.getUser().getId())
                .code(saved.getCode())
                .language(saved.getLanguage())
                .createdAt(Instant.now())
                .build();

        rabbitTemplate.convertAndSend(
                JudgeRabbitConfig.JUDGE_EXCHANGE,
                JudgeRabbitConfig.RK_SUBMIT,
                msg);

        log.info("Published judge job: submissionId={}, exerciseId={}",
                saved.getSubmissionId(), saved.getExercise().getExerciseId());
    }

    @Override
    public void publishRunJob(JudgeRequestDTO request, UUID userId) {
        JudgeRunMessage msg = JudgeRunMessage.builder()
                .runId(UUID.randomUUID())
                .exerciseId(request.getExerciseId())
                .userId(userId)
                .code(request.getSourceCode())
                .language(request.getLanguage())
                .createdAt(Instant.now())
                .build();

        rabbitTemplate.convertAndSend(
                JudgeRabbitConfig.JUDGE_EXCHANGE,
                JudgeRabbitConfig.RK_RUN,
                msg);

        log.info("Published run job: userId={}, exerciseId={}", userId, request.getExerciseId());
    }

    @Override
    public void publishRunSingleTestCase(JudgeRequestDTO request, UUID userId) {
        JudgeRunMessage msg = JudgeRunMessage.builder()
                .runId(UUID.randomUUID())
                .exerciseId(request.getExerciseId())
                .userId(userId)
                .code(request.getSourceCode())
                .language(request.getLanguage())
                .testCaseInput(request.getTestCaseInput())
                .testCaseId(request.getTestCaseId())
                .createdAt(Instant.now())
                .build();

        rabbitTemplate.convertAndSend(
                JudgeRabbitConfig.JUDGE_EXCHANGE,
                JudgeRabbitConfig.RK_RUN,
                msg);

        log.info("Published single run job: userId={}, exerciseId={}", userId, request.getExerciseId());
    }

    @Override
    @Transactional
    public void createContestAttemptIfNeeded(CodingSubmission submission) {
        UUID exerciseId = submission.getExercise().getExerciseId();
        UUID userId = submission.getUser().getId();

        log.info("Creating contest attempt: userId={}, exerciseId={}", userId, exerciseId);

        AttemptInfoDTO attemptInfo = contestExerciseAttemptService
                .getAttemptInfoDTOByUserIDAndExerciseID(userId, exerciseId, "coding");

        if (attemptInfo == null) {
            attemptInfo = new AttemptInfoDTO();
            attemptInfo.setAttemptNumber(0);
            attemptInfo.setExerciseType("coding");
            attemptInfo.setLessonID(codingExerciseService.getLessonIDByExerciseID(exerciseId));
        }

        int currentAttempt = attemptInfo.getAttemptNumber() == null ? 0 : attemptInfo.getAttemptNumber();

        AttemptInfoDTO finalAttemptInfo = attemptInfo;
        CourseLesson lesson = lessonService.findById(attemptInfo.getLessonID())
                .orElseThrow(() -> new RuntimeException("Lesson not found: " + finalAttemptInfo.getLessonID()));

        ContestExerciseAttempt exerciseAttempt = new ContestExerciseAttempt();
        exerciseAttempt.setExerciseID(exerciseId);
        exerciseAttempt.setLesson(lesson);

        User user = new User();
        user.setId(userId);
        exerciseAttempt.setUser(user);

        exerciseAttempt.setSubmittedAt(LocalDateTime.now());
        exerciseAttempt.setExerciseType(attemptInfo.getExerciseType());
        exerciseAttempt.setAttemptNumber(currentAttempt + 1);
        exerciseAttempt.setScore(submission.getScore() != null ? submission.getScore().doubleValue() : 0.0);

        contestExerciseAttemptService.save(exerciseAttempt);

        log.info("Contest attempt created: attemptNumber={}, score={}",
                currentAttempt + 1, exerciseAttempt.getScore());
    }

    @Override
    public JudgeInternalResult judgeCode(JudgeRequestDTO request) {
        Set<ExerciseTestCasesDTO> testCases = getListExerciseTestCase(request.getExerciseId());

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS"));
        String folderName = "sub-" + request.getExerciseId() + "-" + timestamp;

        Path workingDir = hostBaseDir().resolve(folderName);

        int passed = 0;
        int total = (testCases == null) ? 0 : testCases.size();
        int score = 0;

        Integer runtimeMs = null;
        Integer memoryKb = null;

        SubmissionVerdict verdict;
        String message = null;

        try {
            Files.createDirectories(hostBaseDir());
            Files.createDirectories(workingDir);

            LanguageRunner runner = runnerFactory.getRunnerOrThrow(request.getLanguage());
            Path sourceFile = workingDir.resolve(runner.getSourceFileName());
            Files.writeString(sourceFile, request.getSourceCode() == null ? "" : request.getSourceCode());

            dockerCodeExecutionUtil.compileInContainer(workingDir, request.getLanguage());

            if (total == 0) {
                String out = dockerCodeExecutionUtil.runInContainer(workingDir, request.getLanguage(), "");
                verdict = SubmissionVerdict.ACCEPTED;
                message = "Không có test case nào. Thực thi thành công.\n\nKết quả:\n" + out;
                return JudgeInternalResult.builder()
                        .verdict(verdict)
                        .passed(0)
                        .total(0)
                        .score(0)
                        .message(message)
                        .testCaseResults(new ArrayList<>())
                        .build();
            } else {
                boolean allPassed = true;
                List<JudgeRunResponseDTO> testCaseResults = new ArrayList<>();

                for (ExerciseTestCasesDTO tc : testCases) {
                    try {
                        String tcInput = safeString(tc.getInput());
                        String outputRun = dockerCodeExecutionUtil.runInContainer(
                                workingDir,
                                request.getLanguage(),
                                tcInput);

                        String expected = safeTrim(tc.getExpectedOutput());
                        String actual = safeTrim(outputRun);

                        boolean ok = compareOutputsIgnoreSpace(expected, actual);
                        int tcScore = (tc.getPoints() != null ? tc.getPoints() : 0);

                        if (!ok) {
                            allPassed = false;
                        } else {
                            passed++;
                            score += tcScore;
                        }

                        testCaseResults
                                .add(JudgeRunResponseDTO.builder()
                                        .verdict(ok ? "ACCEPTED" : "WRONG_ANSWER")
                                        .status(ok ? "ACCEPTED" : "WRONG_ANSWER")
                                        .actualOutput(actual)
                                        .expectedOutput(expected)
                                        .input(tcInput)
                                        .points(ok ? tcScore : 0)
                                        .isKnownTestCase(true)
                                        .testCaseId(tc.getTestCaseId() != null ? tc.getTestCaseId().toString() : null)
                                        .build());

                    } catch (Exception e) {
                        allPassed = false;
                        testCaseResults
                                .add(JudgeRunResponseDTO.builder()
                                        .verdict("RUNTIME_ERROR")
                                        .status("ERROR")
                                        .message(e.getMessage())
                                        .input(safeString(tc.getInput()))
                                        .isKnownTestCase(true)
                                        .testCaseId(tc.getTestCaseId() != null ? tc.getTestCaseId().toString() : null)
                                        .build());
                    }
                }

                verdict = allPassed ? SubmissionVerdict.ACCEPTED : SubmissionVerdict.WRONG_ANSWER;
                String finalMessage = allPassed ? "Chúc mừng! Bạn đã vượt qua tất cả các test case."
                        : "Bạn đã vượt qua " + passed + "/" + total
                                + " test case. Vui lòng kiểm tra lại các trường hợp bị lỗi.";

                return JudgeInternalResult.builder()
                        .verdict(verdict)
                        .passed(passed)
                        .total(total)
                        .score(score)
                        .message(finalMessage)
                        .testCaseResults(testCaseResults)
                        .build();
            }

        } catch (DockerCodeExecutionUtil.CompilationException e) {
            verdict = SubmissionVerdict.COMPILATION_ERROR;
            message = e.getOutput();
        } catch (Exception e) {
            verdict = SubmissionVerdict.RUNTIME_ERROR;
            message = e.getMessage();
        } finally {
            try {
                DockerCodeExecutionUtil.deleteDirectoryRecursively(workingDir);
            } catch (Exception ignored) {
            }
        }

        return JudgeInternalResult.builder()
                .verdict(verdict)
                .passed(passed)
                .total(total)
                .score(score)
                .runtimeMs(runtimeMs)
                .memoryKb(memoryKb)
                .message(message)
                .build();
    }

    @Override
    public JudgeRunResponseDTO runUserCode(@NonNull JudgeRequestDTO request) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS"));
        String folderName = "run-" + request.getExerciseId() + "-" + timestamp;
        Path workingDir = hostBaseDir().resolve(folderName);

        try {
            Files.createDirectories(hostBaseDir());
            Files.createDirectories(workingDir);

            LanguageRunner runner = runnerFactory.getRunnerOrThrow(request.getLanguage());
            Path sourceFile = workingDir.resolve(runner.getSourceFileName());
            Files.writeString(sourceFile, request.getSourceCode());

            dockerCodeExecutionUtil.compileInContainer(workingDir, request.getLanguage());

            Set<ExerciseTestCasesDTO> testCases = getListExerciseTestCase(request.getExerciseId());

            StringBuilder output = new StringBuilder();

            if (testCases == null || testCases.isEmpty()) {
                output.append(dockerCodeExecutionUtil.runInContainer(workingDir, request.getLanguage(), ""));
                return JudgeRunResponseDTO.builder()
                        .output(output.toString())
                        .status("SUCCESS")
                        .message("")
                        .build();
            }

            boolean allPassed = true;

            for (ExerciseTestCasesDTO testCase : testCases) {
                String outputRun = dockerCodeExecutionUtil.runInContainer(
                        workingDir,
                        request.getLanguage(),
                        safeString(testCase.getInput()));

                String expected = safeTrim(testCase.getExpectedOutput());
                String actual = safeTrim(outputRun);

                boolean passed = compareOutputsIgnoreSpace(expected, actual);
                if (!passed)
                    allPassed = false;

                output.append("Test case:\n")
                        .append("Input:\n").append(safeString(testCase.getInput())).append("\n")
                        .append("Expected:\n").append(expected).append("\n")
                        .append("Actual:\n").append(actual).append("\n")
                        .append(passed ? " Passed\n\n" : " Failed\n\n");
            }

            String status = allPassed ? "SUCCESS" : "FAIL";
            return JudgeRunResponseDTO.builder()
                    .output(output.toString())
                    .status(status)
                    .message("")
                    .build();

        } catch (DockerCodeExecutionUtil.CompilationException e) {
            return JudgeRunResponseDTO.builder()
                    .output(e.getOutput())
                    .status("COMPILATION_ERROR")
                    .message("Lỗi biên dịch")
                    .build();
        } catch (IOException | InterruptedException e) {
            return JudgeRunResponseDTO.builder()
                    .output("")
                    .status("ERROR")
                    .message(e.getMessage())
                    .build();
        } catch (RuntimeException e) {
            return JudgeRunResponseDTO.builder()
                    .output("")
                    .status("ERROR")
                    .message(e.getMessage())
                    .build();
        } finally {
            try {
                DockerCodeExecutionUtil.deleteDirectoryRecursively(workingDir);
            } catch (Exception ignored) {
            }
        }
    }

    @Override
    public JudgeRunResponseDTO runSingleTestCase(JudgeRequestDTO request) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS"));
        String folderName = "single-" + request.getExerciseId() + "-" + timestamp;
        Path workingDir = hostBaseDir().resolve(folderName);

        try {
            Files.createDirectories(hostBaseDir());
            Files.createDirectories(workingDir);

            LanguageRunner runner = runnerFactory.getRunnerOrThrow(request.getLanguage());
            Path sourceFile = workingDir.resolve(runner.getSourceFileName());

            Files.writeString(sourceFile, request.getSourceCode());

            dockerCodeExecutionUtil.compileInContainer(workingDir, request.getLanguage());

            String userProvidedInput = safeString(request.getTestCaseInput()).trim();
            String inputToUse = userProvidedInput;
            String expectedOutput = "";
            boolean isKnownTestCase = false;
            String matchedTestCaseId = null;
            Integer tcPoints = null;

            Set<ExerciseTestCasesDTO> testCases = getListExerciseTestCase(request.getExerciseId());
            if (testCases != null) {
                for (ExerciseTestCasesDTO tc : testCases) {
                    boolean matchById = request.getTestCaseId() != null
                            && tc.getTestCaseId() != null
                            && tc.getTestCaseId().toString().equals(request.getTestCaseId());
                    boolean matchByInput = userProvidedInput.equals(safeString(tc.getInput()).trim());

                    if (matchById || matchByInput) {
                        expectedOutput = safeTrim(tc.getExpectedOutput());
                        inputToUse = safeString(tc.getInput()).trim();
                        isKnownTestCase = true;
                        matchedTestCaseId = tc.getTestCaseId() != null ? tc.getTestCaseId().toString() : null;
                        tcPoints = tc.getPoints();
                        break;
                    }
                }
            }

            String outputRun = dockerCodeExecutionUtil.runInContainer(workingDir, request.getLanguage(), inputToUse);
            String actual = safeTrim(outputRun);

            boolean passed = isKnownTestCase && compareOutputsIgnoreSpace(expectedOutput, actual);

            String verdict = passed ? "ACCEPTED" : (isKnownTestCase ? "WRONG_ANSWER" : "SUCCESS");
            String statusLabel = passed ? "Vượt qua (Passed)"
                    : (isKnownTestCase ? "Sai kết quả (Wrong Answer)" : "Thực thi thành công");

            String summary = statusLabel + "\n" +
                    "Đầu vào: " + inputToUse + "\n" +
                    "Mong đợi: " + (isKnownTestCase ? expectedOutput : "(Tùy chỉnh)") + "\n" +
                    "Thực tế: " + actual;

            return JudgeRunResponseDTO.builder()
                    .output(actual)
                    .status(verdict)
                    .message(summary)
                    .verdict(verdict)
                    .actualOutput(actual)
                    .expectedOutput(isKnownTestCase ? expectedOutput : null)
                    .input(inputToUse)
                    .isKnownTestCase(isKnownTestCase)
                    .testCaseId(matchedTestCaseId)
                    .points(isKnownTestCase && tcPoints != null ? tcPoints : 0)
                    .build();

        } catch (DockerCodeExecutionUtil.CompilationException e) {
            return JudgeRunResponseDTO.builder()
                    .output(e.getOutput())
                    .status("COMPILATION_ERROR")
                    .message("Lỗi biên dịch: \n" + e.getOutput())
                    .verdict("COMPILATION_ERROR")
                    .actualOutput(e.getOutput())
                    .build();
        } catch (IOException | InterruptedException e) {
            return JudgeRunResponseDTO.builder()
                    .output("")
                    .status("ERROR")
                    .message("Lỗi hệ thống: " + e.getMessage())
                    .verdict("RUNTIME_ERROR")
                    .build();
        } catch (RuntimeException e) {
            return JudgeRunResponseDTO.builder()
                    .output("")
                    .status("RUNTIME_ERROR")
                    .message("Lỗi thực thi: " + e.getMessage())
                    .verdict("RUNTIME_ERROR")
                    .build();
        } finally {
            try {
                DockerCodeExecutionUtil.deleteDirectoryRecursively(workingDir);
            } catch (Exception ignored) {
            }
        }
    }

    @Override
    @Transactional
    public CodingSubmissionResponseDTO processPreJudgedSubmission(CodingSubmission sub, JudgeRequestDTO request) {
        List<JudgeRunResponseDTO> frontendResults = request.getTestCaseResults();
        if (frontendResults == null)
            frontendResults = new ArrayList<>();

        Set<ExerciseTestCasesDTO> dbTestCases = getListExerciseTestCase(request.getExerciseId());
        int totalTestcases = (dbTestCases == null) ? 0 : dbTestCases.size();

        int passed = 0;
        int score = 0;
        for (JudgeRunResponseDTO res : frontendResults) {
            if ("ACCEPTED".equals(res.getVerdict())) {
                passed++;
                score += (res.getPoints() != null ? res.getPoints() : 0);
            }
        }

        boolean allCasesJudged = frontendResults.size() >= totalTestcases;
        SubmissionVerdict verdict = (allCasesJudged && passed == totalTestcases) ? SubmissionVerdict.ACCEPTED
                : SubmissionVerdict.WRONG_ANSWER;

        String juryMessage;
        if (verdict == SubmissionVerdict.ACCEPTED) {
            juryMessage = "Chúc mừng! Bạn đã vượt qua tất cả các test case.";
        } else if (passed >= 1) {
            juryMessage = "Bạn đã vượt qua " + passed + "/" + totalTestcases + " bài kiểm tra. Hệ thống đã lưu tiến độ của bạn!";
        } else {
            juryMessage = "Bài làm chưa chính xác. Đã nộp " + frontendResults.size() + "/" + totalTestcases + " test case.";
        }

        sub.setVerdict(verdict);
        sub.setPassedTestcases(passed);
        sub.setTotalTestcases(totalTestcases);
        sub.setScore(score);

        codingSubmissionService.save(sub);
        createContestAttemptIfNeeded(sub);

        // Đánh dấu hoàn thành bài học nếu pass ít nhất 1 test case
        if (passed >= 1 || verdict == SubmissionVerdict.ACCEPTED) {
            UUID lessonId = codingExerciseService.getLessonIDByExerciseID(request.getExerciseId());
            CourseLesson lesson = lessonService.findById(lessonId).orElse(null);
            if (lesson != null && lesson.getModule() != null && lesson.getModule().getCourse() != null) {
                var progressReq = LessonProgressRequest.builder()
                        .courseId(lesson.getModule().getCourse().getCourseId())
                        .lessonId(lesson.getLessonId())
                        .completionPercent(100)
                        .status(ProgressStatus.DONE)
                        .build();
                lessonProgressService.updateProgress(sub.getUser().getId(), progressReq);
            }
        }

        return CodingSubmissionResponseDTO.builder()
                .submissionId(sub.getSubmissionId())
                .exerciseID(request.getExerciseId())
                .userID(sub.getUser().getId())
                .code(request.getSourceCode())
                .language(request.getLanguage())
                .verdict(verdict)
                .passedTestcases(passed)
                .totalTestcases(totalTestcases)
                .score(score)
                .message(juryMessage)
                .testCaseResults(frontendResults)
                .submittedAt(sub.getSubmittedAt())
                .build();
    }

    @Override
    @Deprecated
    public CodingSubmissionResponseDTO submitUserCode(JudgeRequestDTO request) {
        log.info("Submitting user code via consolidated judgeCode method");
        JudgeInternalResult result = judgeCode(request);

        String userName = safeFilePart(UserContext.getUsername());
        UUID userId = userService.findUserIDByUserName(userName);

        return CodingSubmissionResponseDTO.builder()
                .exerciseID(request.getExerciseId())
                .userID(userId)
                .code(request.getSourceCode())
                .language(request.getLanguage())
                .verdict(result.getVerdict())
                .passedTestcases(result.getPassed())
                .totalTestcases(result.getTotal())
                .runtimeMs(result.getRuntimeMs())
                .memoryKb(result.getMemoryKb())
                .score(result.getScore())
                .submittedAt(Instant.now())
                .build();
    }

    // Helper methods
    private Path hostBaseDir() {
        String v = System.getenv(ENV_HOST);
        return Paths.get(v != null && !v.isBlank() ? v : "Code_Dir");
    }

    private Set<ExerciseTestCasesDTO> getListExerciseTestCase(UUID exerciseId) {
        return exerciseTestCaseMapper.toDto(
                exerciseTestCaseRepository.getExerciseTestCasesDTOByExerciseID(exerciseId));
    }

    private boolean compareOutputsIgnoreSpace(String expected, String actual) {
        if (expected == null && actual == null)
            return true;
        if (expected == null || actual == null)
            return false;

        String expRegex = expected.replaceAll("\\s+", "");
        String actRegex = actual.replaceAll("\\s+", "");

        return expRegex.equals(actRegex);
    }

    private static String safeTrim(String s) {
        return s == null ? "" : s.trim();
    }

    private static String safeString(String s) {
        return s == null ? "" : s;
    }

    private static String safeFilePart(String s) {
        if (s == null || s.isBlank())
            return "user";
        return s.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}