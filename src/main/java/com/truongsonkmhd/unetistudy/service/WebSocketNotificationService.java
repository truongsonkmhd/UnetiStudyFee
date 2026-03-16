package com.truongsonkmhd.unetistudy.service;

import com.truongsonkmhd.unetistudy.dto.coding_submission.CodingSubmissionResponseDTO;

import java.util.UUID;

public interface WebSocketNotificationService {
    void notifySubmissionResult(UUID userId, CodingSubmissionResponseDTO submission);

    void notifySubmissionStatus(UUID userId, UUID submissionId, String status);

    void notifyRunResult(UUID userId, Object result);

    void notifyRunStatus(UUID userId, java.util.UUID runId, String status);

    void broadcastSubmission(CodingSubmissionResponseDTO submission);
}
