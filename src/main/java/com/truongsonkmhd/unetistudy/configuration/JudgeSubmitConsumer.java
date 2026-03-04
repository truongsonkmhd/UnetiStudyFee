package com.truongsonkmhd.unetistudy.configuration;

import com.rabbitmq.client.Channel;
import com.truongsonkmhd.unetistudy.common.ProgressStatus;
import com.truongsonkmhd.unetistudy.common.SubmissionVerdict;
import com.truongsonkmhd.unetistudy.dto.coding_exercise_dto.JudgeRequestDTO;
import com.truongsonkmhd.unetistudy.dto.coding_submission.CodingSubmissionResponseDTO;
import com.truongsonkmhd.unetistudy.dto.progress_dto.LessonProgressRequest;
import com.truongsonkmhd.unetistudy.model.lesson.CodingSubmission;
import com.truongsonkmhd.unetistudy.dto.judge_rabbit_mq.JudgeSubmitMessage;
import com.truongsonkmhd.unetistudy.service.CodingSubmissionService;
import com.truongsonkmhd.unetistudy.service.JudgeService;
import com.truongsonkmhd.unetistudy.service.LessonProgressService;
import com.truongsonkmhd.unetistudy.service.WebSocketNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class JudgeSubmitConsumer {

    private static final int MAX_RETRY = 5;

    private final CodingSubmissionService codingSubmissionService;
    private final JudgeService judgeService;
    private final RabbitTemplate rabbitTemplate;
    private final WebSocketNotificationService webSocketService;
    private final LessonProgressService lessonProgressService;

    @RabbitListener(queues = JudgeRabbitConfig.QUEUE_SUBMIT)
    public void consume(JudgeSubmitMessage payload, Message message, Channel channel) throws Exception {

        long tag = message.getMessageProperties().getDeliveryTag();
        int retryCount = getRetryCountFromXDeath(message, JudgeRabbitConfig.QUEUE_SUBMIT);

        log.info("Processing judge job: submissionId={}, retryCount={}", payload.getSubmissionId(), retryCount);

        try {
            CodingSubmission sub = codingSubmissionService.getSubmissionById(payload.getSubmissionId());

            // 1) Idempotency: nếu đã chấm xong rồi thì ACK luôn
            if (isFinalVerdict(sub.getVerdict())) {
                log.info("Skip judging submissionId={} - verdict already final: {}",
                        sub.getSubmissionId(), sub.getVerdict());
                channel.basicAck(tag, false);
                return;
            }

            // 2) Set RUNNING trước khi chấm
            try {
                sub.setVerdict(SubmissionVerdict.RUNNING);
                codingSubmissionService.save(sub);

                // Push status RUNNING qua WebSocket
                webSocketService.notifySubmissionStatus(
                        payload.getUserId(),
                        payload.getSubmissionId(),
                        "RUNNING");
            } catch (Exception e) {
                log.error("Failed to update verdict to RUNNING: submissionId={}",
                        payload.getSubmissionId(), e);
                throw e;
            }

            // 3) Build request để chấm
            JudgeRequestDTO req = JudgeRequestDTO.builder()
                    .exerciseId(payload.getExerciseId())
                    .language(payload.getLanguage())
                    .sourceCode(payload.getCode())
                    .build();

            // 4) Chấm bài
            log.info("Judging code: submissionId={}", payload.getSubmissionId());
            var result = judgeService.judgeCode(req);

            // 5) Update kết quả vào DB
            sub.setVerdict(result.getVerdict());
            sub.setPassedTestcases(result.getPassed());
            sub.setTotalTestcases(result.getTotal());
            sub.setRuntimeMs(result.getRuntimeMs());
            sub.setMemoryKb(result.getMemoryKb());
            sub.setScore(result.getScore());
            codingSubmissionService.save(sub);

            log.info("Judge completed: submissionId={}, verdict={}, score={}/{}",
                    payload.getSubmissionId(), result.getVerdict(), result.getPassed(), result.getTotal());

            // 6) Tạo Contest Attempt nếu cần (QUAN TRỌNG: chỉ khi đã có score thực)
            judgeService.createContestAttemptIfNeeded(sub);

            // 6.1) Update Lesson Progress if ACCEPTED for all lessons containing this

            if (sub.getVerdict() == SubmissionVerdict.ACCEPTED && sub.getExercise().getCourseLessons() != null) {
                for (var lesson : sub.getExercise().getCourseLessons()) {
                    try {
                        if (lesson.getModule() != null && lesson.getModule().getCourse() != null) {
                            lessonProgressService.updateProgress(payload.getUserId(),
                                    LessonProgressRequest.builder()
                                            .courseId(lesson.getModule().getCourse().getCourseId())
                                            .lessonId(lesson.getLessonId())
                                            .status(ProgressStatus.DONE)
                                            .watchedPercent(100)
                                            .timeSpentSec(0)
                                            .build());
                        }
                    } catch (Exception e) {
                        log.error("Failed to update lesson progress after successful coding submission for lesson: {}",
                                lesson.getLessonId(), e);
                    }
                }
            }

            // 7) Push kết quả cuối cùng qua WebSocket
            CodingSubmissionResponseDTO responseDTO = CodingSubmissionResponseDTO.builder()
                    .submissionId(sub.getSubmissionId())
                    .exerciseID(sub.getExercise().getExerciseId())
                    .userID(sub.getUser().getId())
                    .code(sub.getCode())
                    .language(sub.getLanguage())
                    .verdict(result.getVerdict())
                    .passedTestcases(result.getPassed())
                    .totalTestcases(result.getTotal())
                    .runtimeMs(result.getRuntimeMs())
                    .memoryKb(result.getMemoryKb())
                    .score(result.getScore())
                    .submittedAt(sub.getSubmittedAt())
                    .build();

            webSocketService.notifySubmissionResult(payload.getUserId(), responseDTO);

            // OK - ACK message
            channel.basicAck(tag, false);

        } catch (Exception e) {
            log.error("Judge failed: submissionId={}, retryCount={}",
                    payload.getSubmissionId(), retryCount, e);

            // Cập nhật verdict lỗi (cẩn thận vì retry còn chạy)
            try {
                CodingSubmission sub = codingSubmissionService.getSubmissionById(payload.getSubmissionId());
                if (!isFinalVerdict(sub.getVerdict())) {
                    sub.setVerdict(SubmissionVerdict.RUNTIME_ERROR);
                    codingSubmissionService.save(sub);
                }
            } catch (Exception ignored) {
                log.warn("Failed to update error verdict for submissionId={}",
                        payload.getSubmissionId());
            }

            if (retryCount >= MAX_RETRY) {
                // Quá số lần retry -> đẩy DLQ
                log.error("Max retry exceeded: submissionId={}, moving to DLQ",
                        payload.getSubmissionId());

                rabbitTemplate.convertAndSend(
                        JudgeRabbitConfig.JUDGE_EXCHANGE,
                        JudgeRabbitConfig.RK_SUBMIT_DLQ,
                        payload);

                // ACK message hiện tại để không loop nữa
                channel.basicAck(tag, false);
                return;
            }

            // Reject để message đi DLX sang retry queue
            log.info("Rejecting message for retry: submissionId={}, retryCount={}",
                    payload.getSubmissionId(), retryCount);
            channel.basicReject(tag, false);
        }
    }

    /**
     * Verdict cuối cùng - không cần chấm lại
     */
    private boolean isFinalVerdict(SubmissionVerdict v) {
        if (v == null)
            return false;
        return switch (v) {
            case ACCEPTED,
                    WRONG_ANSWER,
                    TIME_LIMIT_EXCEEDED,
                    MEMORY_LIMIT_EXCEEDED,
                    RUNTIME_ERROR,
                    COMPILATION_ERROR ->
                true;
            case PENDING, RUNNING -> false;
        };
    }

    /**
     * Đếm số lần retry từ x-death header
     */
    private int getRetryCountFromXDeath(Message message, String queueName) {
        Object xDeath = message.getMessageProperties().getHeaders().get("x-death");
        if (!(xDeath instanceof List<?> deaths))
            return 0;

        int total = 0;
        for (Object d : deaths) {
            if (!(d instanceof Map<?, ?> death))
                continue;

            Object q = death.get("queue");
            Object count = death.get("count");

            if (queueName.equals(q) && count instanceof Long c) {
                total += c.intValue();
            }
        }
        return total;
    }
}