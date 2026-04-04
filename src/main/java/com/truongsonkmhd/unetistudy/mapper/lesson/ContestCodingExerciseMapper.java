package com.truongsonkmhd.unetistudy.mapper.lesson;

import com.truongsonkmhd.unetistudy.dto.coding_exercise_dto.ContestCodingExerciseDTO;
import com.truongsonkmhd.unetistudy.mapper.EntityMapper;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.CodingExercise;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = { ExerciseTestCaseMapper.class }, builder = @Builder(disableBuilder = true))

public interface ContestCodingExerciseMapper extends EntityMapper<ContestCodingExerciseDTO, CodingExercise> {
    @Override
    @Mapping(target = "contestLessonId", expression = "java(entity.getContestLessons().isEmpty() ? null : entity.getContestLessons().get(0).getContestLessonId())")
    ContestCodingExerciseDTO toDto(CodingExercise entity);

    @Override
    @Mapping(target = "courseLessons", ignore = true)
    @Mapping(target = "contestLessons", ignore = true)
    @Mapping(target = "exerciseTestCases", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    CodingExercise toEntity(ContestCodingExerciseDTO dto);
}
