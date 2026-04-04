package com.truongsonkmhd.unetistudy.mapper.lesson;

import com.truongsonkmhd.unetistudy.dto.coding_exercise_dto.CodingExerciseDTO;
import com.truongsonkmhd.unetistudy.mapper.EntityMapper;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.CodingExercise;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = { ExerciseTestCaseMapper.class }, builder = @Builder(disableBuilder = true))

public interface CodingExerciseDTOMapper extends EntityMapper<CodingExerciseDTO, CodingExercise> {
    @Override
    @Mapping(target = "contestLessonId", expression = "java(entity.getContestLessons().isEmpty() ? null : entity.getContestLessons().get(0).getContestLessonId())")
    CodingExerciseDTO toDto(CodingExercise entity);

    @Override
    @Mapping(target = "exerciseTestCases", ignore = true)
    @Mapping(target = "courseLessons", ignore = true)
    @Mapping(target = "contestLessons", ignore = true)
    CodingExercise toEntity(CodingExerciseDTO dto);

}
