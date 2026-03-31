package com.truongsonkmhd.unetistudy.service;

import com.truongsonkmhd.unetistudy.dto.contest_lesson.ContestSessionResponse;
import com.truongsonkmhd.unetistudy.dto.contest_lesson.ContestSubmissionRequest;
import com.truongsonkmhd.unetistudy.dto.contest_lesson.ContestSubmissionResult;

import java.util.UUID;

public interface ClassContestSubmissionService {
    ContestSessionResponse startSubmission(UUID userId, UUID classContestId);
    ContestSubmissionResult submit(UUID submissionId, ContestSubmissionRequest request);
    ContestSessionResponse getCurrentSession(UUID userId, UUID classContestId);
}
