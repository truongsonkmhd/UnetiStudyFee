package com.truongsonkmhd.unetistudy.mapper.lesson;

import com.truongsonkmhd.unetistudy.dto.exercise_test_cases_dto.ExerciseTestCasesDTO;
import com.truongsonkmhd.unetistudy.mapper.EntityMapper;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.ExerciseTestCase;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", builder = @Builder(disableBuilder = true))

public interface ExerciseTestCaseMapper extends EntityMapper<ExerciseTestCasesDTO, ExerciseTestCase> {

    @Override
    ExerciseTestCasesDTO toDto(ExerciseTestCase entity);

    @Override
    @Mapping(target = "codingExercise", ignore = true)
    @Mapping(target = "testCaseId", ignore = true)
    ExerciseTestCase toEntity(ExerciseTestCasesDTO dto);
}
