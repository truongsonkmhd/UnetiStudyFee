package com.truongsonkmhd.unetistudy.controller.course;

import com.truongsonkmhd.unetistudy.common.SubmissionVerdict;
import com.truongsonkmhd.unetistudy.context.UserContext;
import com.truongsonkmhd.unetistudy.dto.coding_exercise_dto.CodingExerciseDTO;
import com.truongsonkmhd.unetistudy.dto.coding_exercise_dto.JudgeRequestDTO;
import com.truongsonkmhd.unetistudy.dto.coding_submission.CodingSubmissionResponseDTO;
import com.truongsonkmhd.unetistudy.dto.contest_exercise_attempt.AttemptInfoDTO;
import com.truongsonkmhd.unetistudy.dto.a_common.ErrorResponseMessage;
import com.truongsonkmhd.unetistudy.dto.a_common.IResponseMessage;
import com.truongsonkmhd.unetistudy.dto.a_common.ResponseMessage;
import com.truongsonkmhd.unetistudy.dto.exercise_test_cases_dto.ExerciseTestCasesDTO;
import com.truongsonkmhd.unetistudy.model.*;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.CourseLesson;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.CodingExercise;
import com.truongsonkmhd.unetistudy.model.lesson.CodingSubmission;
import com.truongsonkmhd.unetistudy.model.lesson.ContestExerciseAttempt;
import com.truongsonkmhd.unetistudy.service.*;
import com.truongsonkmhd.unetistudy.service.impl.coding.CodingExerciseServiceImpl;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/judge")
@Slf4j(topic = "JUDGE-CONTROLLER")
@Tag(name = "judge Controller")
@RequiredArgsConstructor
public class JudgeController {

    private final JudgeService judgeService;

    private final UserService userService;

    private final CodingExerciseService codingExerciseService;

    private final CodingSubmissionService codingSubmissionService;

    private final ContestExerciseAttemptService contestExerciseAttemptService;

    private final CourseLessonService lessonService;

    @PostMapping("/run")
    public ResponseEntity<IResponseMessage> handleRunCode(@RequestBody JudgeRequestDTO request) {
        UUID userId = UserContext.getUserID();
        judgeService.publishRunJob(request, userId);
        return ResponseEntity.ok().body(
                ResponseMessage.CreatedSuccess("Yêu cầu chạy mã đã được gửi. Kết quả sẽ hiển thị qua WebSocket."));
    }

    @PostMapping("/run-single")
    public ResponseEntity<IResponseMessage> handleRunSingleTestCase(@RequestBody JudgeRequestDTO request) {
        UUID userId = UserContext.getUserID();
        judgeService.publishRunSingleTestCase(request, userId);
        return ResponseEntity.ok().body(ResponseMessage
                .CreatedSuccess("Yêu cầu chạy thử testcase đã được gửi. Kết quả sẽ hiển thị qua WebSocket."));
    }

    // @PostMapping("/submit")
    // public ResponseEntity<IResponseMessage> handleSubmitCode(
    // @RequestBody JudgeRequestDTO request) {
    // // 1) Call judge -> nhận kết quả
    // CodingSubmissionResponseDTO submission =
    // judgeService.submitUserCode(request);
    //
    // // 2) Ensure IDs (nếu judgeService chưa set)
    // submission.setExerciseID(request.getExerciseId());
    //
    // // 3) Load entities
    // User userEntity = userService.findById(submission.getUserID());
    // CodingExercise codingExercise =
    // codingExerciseService.getExerciseEntityByID(request.getExerciseId());
    //
    // // 4) Build entity để lưu DB (đúng theo entity CodingSubmission của UNETI)
    // CodingSubmission codingSubmission = CodingSubmission.builder()
    // .exercise(codingExercise)
    // .user(userEntity)
    // .code(submission.getCode())
    // .language(submission.getLanguage() != null ? submission.getLanguage() :
    // request.getLanguage())
    // .verdict(submission.getVerdict())
    // .passedTestcases(submission.getPassedTestcases() != null ?
    // submission.getPassedTestcases() : 0)
    // .totalTestcases(submission.getTotalTestcases() != null ?
    // submission.getTotalTestcases() : 0)
    // .runtimeMs(submission.getRuntimeMs())
    // .memoryKb(submission.getMemoryKb())
    // .score(submission.getScore() != null ? submission.getScore() : 0)
    // .build();
    //
    // CodingSubmission saved = codingSubmissionService.save(codingSubmission);
    //
    // // 5) Trả submissionId + submittedAt về client (nếu cần)
    // submission.setSubmittedAt(saved.getSubmittedAt());
    //
    // // 6) Contest attempt (fix time type theo entity Attempt của bạn)
    // AttemptInfoDTO attemptInfo = contestExerciseAttemptService
    // .getAttemptInfoDTOByUserIDAndExerciseID(UserContext.getUserID(),
    // request.getExerciseId(), "coding");
    //
    // if (attemptInfo == null) {
    // attemptInfo = new AttemptInfoDTO();
    // attemptInfo.setAttemptNumber(0);
    // attemptInfo.setExerciseType("coding");
    // attemptInfo.setLessonID(codingExerciseService.getLessonIDByExerciseID(request.getExerciseId()));
    // }
    //
    // int currentAttempt = attemptInfo.getAttemptNumber() == null ? 0 :
    // attemptInfo.getAttemptNumber();
    //
    // ContestExerciseAttempt exerciseAttempt = new ContestExerciseAttempt();
    // exerciseAttempt.setExerciseID(request.getExerciseId());
    //
    // CourseLesson lesson = lessonService.findById(attemptInfo.getLessonID())
    // .orElseThrow(() -> new RuntimeException("Lesson not found"));
    // exerciseAttempt.setLesson(lesson);
    //
    // User user = new User();
    // user.setId(UserContext.getUserID());
    // exerciseAttempt.setUser(user);
    //
    // exerciseAttempt.setSubmittedAt(LocalDateTime.now());
    //
    // exerciseAttempt.setExerciseType(attemptInfo.getExerciseType());
    // exerciseAttempt.setAttemptNumber(currentAttempt + 1);
    // exerciseAttempt.setScore(submission.getScore() != null ?
    // submission.getScore().doubleValue() : 0.0);
    //
    // contestExerciseAttemptService.save(exerciseAttempt);
    // return ResponseEntity.ok().body(ResponseMessage.CreatedSuccess(submission));
    // }

    @PostMapping("/submitMQ")
    public ResponseEntity<IResponseMessage> handleSubmitCodeMQ(@RequestBody JudgeRequestDTO request) {
        try {
            UUID userId = UserContext.getUserID();

            log.info("Async submit started: userId={}, exerciseId={}", userId, request.getExerciseId());

            CodingExercise exercise = codingExerciseService.getExerciseEntityByID(request.getExerciseId());
            if (exercise == null) {
                log.error("Exercise not found: {}", request.getExerciseId());
                throw new RuntimeException("Exercise not found: " + request.getExerciseId());
            }

            User userEntity = userService.findById(userId);
            if (userEntity == null) {
                log.error("User not found: {}", userId);
                throw new RuntimeException("User not found: " + userId);
            }

            // Tạo submission
            CodingSubmission codingSubmission = CodingSubmission.builder()
                    .exercise(exercise)
                    .user(userEntity)
                    .code(request.getSourceCode())
                    .language(request.getLanguage())
                    .verdict(SubmissionVerdict.PENDING)
                    .passedTestcases(0)
                    .totalTestcases(0)
                    .runtimeMs(null)
                    .memoryKb(null)
                    .score(0)
                    .build();

            CodingSubmission saved = codingSubmissionService.save(codingSubmission);

            log.info("Processing submission based on frontend results: submissionId={}", saved.getSubmissionId());
            CodingSubmissionResponseDTO response = judgeService.processPreJudgedSubmission(saved, request);
            return ResponseEntity.ok().body(ResponseMessage.CreatedSuccess(response));
        } catch (Exception e) {
            log.error("Async submit failed: exerciseId={}", request.getExerciseId(), e);
            throw e;
        }
    }

    @GetMapping("/exercise/{exerciseId}")
    public ResponseEntity<IResponseMessage> getExerciseDetail(@PathVariable UUID exerciseId) {
        CodingExercise exercise = codingExerciseService.getExerciseEntityByID(exerciseId);
        if (exercise == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ErrorResponseMessage.BadRequest("Exercise not found"));
        }

        CodingExerciseDTO dto = CodingExerciseDTO.builder()
                .exerciseId(exercise.getExerciseId())
                .templateId(exercise.getTemplateId())
                .title(exercise.getTitle())
                .description(exercise.getDescription())
                .programmingLanguage(exercise.getProgrammingLanguage())
                .difficulty(exercise.getDifficulty())
                .points(exercise.getPoints())
                .timeLimitMs(exercise.getTimeLimitMs())
                .memoryLimitMb(exercise.getMemoryLimitMb())
                .slug(exercise.getSlug())
                .inputFormat(exercise.getInputFormat())
                .outputFormat(exercise.getOutputFormat())
                .constraintName(exercise.getConstraintName())
                .initialCode(exercise.getInitialCode())
                .exerciseTestCases(exercise.getExerciseTestCases().stream()
                        .map(tc -> ExerciseTestCasesDTO
                                .builder()
                                .testCaseId(tc.getTestCaseId())
                                .input(tc.getInput())
                                .expectedOutput(tc.getExpectedOutput())
                                .isSample(tc.getIsSample())
                                .explanation(tc.getExplanation())
                                .points(tc.getPoints())
                                .build())
                        .toList())
                .build();

        return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(dto));
    }

    @GetMapping("/submission/{submissionId}")
    public ResponseEntity<IResponseMessage> getSubmissionResult(
            @PathVariable UUID submissionId) {
        try {
            CodingSubmission submission = codingSubmissionService.getSubmissionById(submissionId);

            if (submission == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ErrorResponseMessage.BadRequest("Submission not found"));
            }

            CodingSubmissionResponseDTO response = CodingSubmissionResponseDTO.builder()
                    .submissionId(submission.getSubmissionId())
                    .exerciseID(submission.getExercise().getExerciseId())
                    .userID(submission.getUser().getId())
                    .code(submission.getCode())
                    .language(submission.getLanguage())
                    .verdict(submission.getVerdict())
                    .passedTestcases(submission.getPassedTestcases())
                    .totalTestcases(submission.getTotalTestcases())
                    .runtimeMs(submission.getRuntimeMs())
                    .memoryKb(submission.getMemoryKb())
                    .score(submission.getScore())
                    .submittedAt(submission.getSubmittedAt())
                    .build();

            return ResponseEntity.ok()
                    .body(ResponseMessage.CreatedSuccess(response));

        } catch (Exception e) {
            log.error("Failed to get submission: submissionId={}", submissionId, e);
            throw e;
        }
    }

}
