package com.truongsonkmhd.unetistudy.mapper.coding_submission;

import com.truongsonkmhd.unetistudy.dto.contest_exercise_attempt.AttemptInfoDTO;
import com.truongsonkmhd.unetistudy.mapper.EntityMapper;
import com.truongsonkmhd.unetistudy.model.lesson.ContestExerciseAttempt;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ContestExerciseAttemptMapper extends EntityMapper<AttemptInfoDTO, ContestExerciseAttempt> {

    @Override
    @Mapping(source = "lesson.lessonId", target = "lessonID")
    AttemptInfoDTO toDto(ContestExerciseAttempt entity);

    @Override
    @Mapping(source = "lessonID", target = "lesson.lessonId")
    @Mapping(target = "attemptID", ignore = true)
    @Mapping(target = "exerciseID", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "submittedAt", ignore = true)
    @Mapping(target = "score", ignore = true)
    ContestExerciseAttempt toEntity(AttemptInfoDTO dto);
}
