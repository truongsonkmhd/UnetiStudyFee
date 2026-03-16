package com.truongsonkmhd.unetistudy.service;

import com.truongsonkmhd.unetistudy.dto.coding_exercise_dto.JudgeRequestDTO;
import com.truongsonkmhd.unetistudy.dto.coding_exercise_dto.JudgeRunResponseDTO;
import com.truongsonkmhd.unetistudy.dto.coding_submission.CodingSubmissionResponseDTO;
import com.truongsonkmhd.unetistudy.model.lesson.CodingSubmission;
import com.truongsonkmhd.unetistudy.dto.judge_rabbit_mq.JudgeInternalResult;

public interface JudgeService {

    JudgeRunResponseDTO runUserCode(JudgeRequestDTO request);

    JudgeRunResponseDTO runSingleTestCase(JudgeRequestDTO request);

    CodingSubmissionResponseDTO submitUserCode(JudgeRequestDTO request);

    void publishSubmitJob(CodingSubmission saved, JudgeRequestDTO request);

    void publishRunJob(JudgeRequestDTO request, java.util.UUID userId);

    void publishRunSingleTestCase(JudgeRequestDTO request, java.util.UUID userId);

    JudgeInternalResult judgeCode(JudgeRequestDTO request);

    void createContestAttemptIfNeeded(CodingSubmission submission);

}
