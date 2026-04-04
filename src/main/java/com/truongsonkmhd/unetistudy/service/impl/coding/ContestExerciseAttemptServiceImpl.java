package com.truongsonkmhd.unetistudy.service.impl.coding;

import com.truongsonkmhd.unetistudy.dto.contest_exercise_attempt.AttemptInfoDTO;
import com.truongsonkmhd.unetistudy.mapper.coding_submission.ContestExerciseAttemptMapper;
import com.truongsonkmhd.unetistudy.model.lesson.ContestExerciseAttempt;
import com.truongsonkmhd.unetistudy.repository.coding.ContestExerciseAttemptRepository;
import com.truongsonkmhd.unetistudy.service.ContestExerciseAttemptService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ContestExerciseAttemptServiceImpl implements ContestExerciseAttemptService {
    private final ContestExerciseAttemptRepository contestExerciseAttemptRepository;

    private final ContestExerciseAttemptMapper contestExerciseAttemptMapper;

    @Override
    public AttemptInfoDTO getAttemptInfoDTOByUserIDAndExerciseID(UUID userID, UUID exerciseID, String exerciseType) {
        return contestExerciseAttemptMapper.toDto(contestExerciseAttemptRepository
                .getAttemptInfoDTOByUserIDAndExerciseID(userID, exerciseID, exerciseType));
    }

    @Override
    @Transactional
    public ContestExerciseAttempt save(ContestExerciseAttempt contestExerciseAttempt) {
        return contestExerciseAttemptRepository.save(contestExerciseAttempt);
    }
}
