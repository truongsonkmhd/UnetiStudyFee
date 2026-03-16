package com.truongsonkmhd.unetistudy.service.impl.coding;

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
                message = out;
            } else {
                boolean allPassed = true;

                for (ExerciseTestCasesDTO tc : testCases) {
                    String outputRun = dockerCodeExecutionUtil.runInContainer(
                            workingDir,
                            request.getLanguage(),
                            safeString(tc.getInput()));

                    String expected = safeTrim(tc.getExpectedOutput());
                    String actual = safeTrim(outputRun);

                    boolean ok = expected.equals(actual);
                    if (!ok) {
                        allPassed = false;
                    } else {
                        passed++;
                        score += (tc.getScore() != null ? tc.getScore() : 0);
                    }
                }

                verdict = allPassed ? SubmissionVerdict.ACCEPTED : SubmissionVerdict.WRONG_ANSWER;
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
                return new JudgeRunResponseDTO(output.toString(), "SUCCESS", "");
            }

            boolean allPassed = true;

            for (ExerciseTestCasesDTO testCase : testCases) {
                String outputRun = dockerCodeExecutionUtil.runInContainer(
                        workingDir,
                        request.getLanguage(),
                        safeString(testCase.getInput()));

                String expected = safeTrim(testCase.getExpectedOutput());
                String actual = safeTrim(outputRun);

                boolean passed = expected.equals(actual);
                if (!passed)
                    allPassed = false;

                output.append("Test case:\n")
                        .append("Input:\n").append(safeString(testCase.getInput())).append("\n")
                        .append("Expected:\n").append(expected).append("\n")
                        .append("Actual:\n").append(actual).append("\n")
                        .append(passed ? "✅ Passed\n\n" : "❌ Failed\n\n");
            }

            String status = allPassed ? "SUCCESS" : "FAIL";
            return new JudgeRunResponseDTO(output.toString(), status, "");

        } catch (DockerCodeExecutionUtil.CompilationException e) {
            return new JudgeRunResponseDTO(e.getOutput(), "COMPILATION_ERROR", "Lỗi biên dịch");
        } catch (IOException | InterruptedException e) {
            return new JudgeRunResponseDTO("", "ERROR", e.getMessage());
        } catch (RuntimeException e) {
            return new JudgeRunResponseDTO("", "ERROR", e.getMessage());
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

            // 1. Tìm Expected Output và Verify Input từ Database
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
                        break;
                    }
                }
            }

            // 2. Chạy Code lần đầu với test case đã chọn
            String outputRun = dockerCodeExecutionUtil.runInContainer(workingDir, request.getLanguage(), inputToUse);
            String actual = safeTrim(outputRun);

            // 3. Kiểm tra kết quả ban đầu
            boolean passed = isKnownTestCase && expectedOutput.equals(actual);

            String verdict = passed ? "ACCEPTED" : (isKnownTestCase ? "WRONG_ANSWER" : "SUCCESS");
            String statusLabel = passed ? "Vượt qua (Passed)"
                    : (isKnownTestCase ? "Sai kết quả (Wrong Answer)" : "Thực thi thành công");

            String summary = statusLabel + "\n" +
                    "Đầu vào lọc: " + inputToUse + "\n" +
                    "Mong đợi: " + (isKnownTestCase ? expectedOutput : "(Tùy chỉnh)") + "\n" +
                    "Thực tế: " + actual;

            return new JudgeRunResponseDTO(actual, verdict, summary);

        } catch (DockerCodeExecutionUtil.CompilationException e) {
            return new JudgeRunResponseDTO(e.getOutput(), "COMPILATION_ERROR", "Lỗi biên dịch: \n" + e.getOutput());
        } catch (IOException | InterruptedException e) {
            return new JudgeRunResponseDTO("", "ERROR", "Lỗi hệ thống: " + e.getMessage());
        } catch (RuntimeException e) {
            return new JudgeRunResponseDTO("", "RUNTIME_ERROR", "Lỗi thực thi: " + e.getMessage());
        } finally {
            try {
                DockerCodeExecutionUtil.deleteDirectoryRecursively(workingDir);
            } catch (Exception ignored) {
            }
        }
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