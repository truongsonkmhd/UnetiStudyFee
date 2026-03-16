package com.truongsonkmhd.unetistudy.service.impl.coding;

import com.truongsonkmhd.unetistudy.dto.coding_submission.CodingSubmissionResponseDTO;
import com.truongsonkmhd.unetistudy.dto.websocket.RunStatusUpdate;
import com.truongsonkmhd.unetistudy.dto.websocket.SubmissionStatusUpdate;
import com.truongsonkmhd.unetistudy.service.WebSocketNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketNotificationServiceImpl implements WebSocketNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Push kết quả submission cho user cụ thể
     *
     * @param userId     ID của user đang chờ kết quả
     * @param submission Kết quả submission đã chấm
     */
    @Override
    public void notifySubmissionResult(UUID userId, CodingSubmissionResponseDTO submission) {
        String destination = "/queue/submission/" + userId;

        log.info("Pushing submission result to user: userId={}, submissionId={}, verdict={}",
                userId, submission.getSubmissionId(), submission.getVerdict());

        messagingTemplate.convertAndSend(destination, submission);
    }

    /**
     * Push update trạng thái submission (PENDING -> RUNNING -> ACCEPTED...)
     */
    @Override
    public void notifySubmissionStatus(UUID userId, UUID submissionId, String status) {
        String destination = "/queue/submission/" + userId;

        var statusUpdate = new SubmissionStatusUpdate(submissionId, status);

        log.info("Pushing status update: userId={}, submissionId={}, status={}",
                userId, submissionId, status);

        messagingTemplate.convertAndSend(destination, statusUpdate);
    }

    @Override
    public void notifyRunResult(UUID userId, Object result) {
        String destination = "/queue/run/" + userId;
        log.info("Pushing run result to user: userId={}", userId);
        messagingTemplate.convertAndSend(destination, result);
    }

    @Override
    public void notifyRunStatus(UUID userId, UUID runId, String status) {
        String destination = "/queue/run/" + userId;
        var statusUpdate = new RunStatusUpdate(runId, status);
        log.info("Pushing run status update: userId={}, runId={}, status={}", userId, runId, status);
        messagingTemplate.convertAndSend(destination, statusUpdate);
    }

    /**
     * Broadcast để tất cả users thấy (ví dụ: leaderboard realtime)
     */
    @Override
    public void broadcastSubmission(CodingSubmissionResponseDTO submission) {
        messagingTemplate.convertAndSend("/topic/submissions", submission);
    }
}