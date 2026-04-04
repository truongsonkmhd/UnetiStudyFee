package com.truongsonkmhd.unetistudy.service;

import com.truongsonkmhd.unetistudy.dto.contest_exercise_attempt.AttemptInfoDTO;
import com.truongsonkmhd.unetistudy.model.lesson.ContestExerciseAttempt;

import java.util.UUID;

public interface ContestExerciseAttemptService {
    AttemptInfoDTO getAttemptInfoDTOByUserIDAndExerciseID(UUID userID, UUID exerciseID, String exerciseType);

    ContestExerciseAttempt save(ContestExerciseAttempt contestExerciseAttempt);
}
