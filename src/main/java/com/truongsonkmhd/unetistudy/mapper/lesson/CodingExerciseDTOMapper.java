package com.truongsonkmhd.unetistudy.mapper.lesson;

import com.truongsonkmhd.unetistudy.dto.coding_exercise_dto.CodingExerciseDTO;
import com.truongsonkmhd.unetistudy.mapper.EntityMapper;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.CodingExercise;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(
        componentModel = "spring",
        uses = { ExerciseTestCaseMapper.class}
)
public interface CodingExerciseDTOMapper extends EntityMapper<CodingExerciseDTO, CodingExercise> {
    @Override
    @Mapping(source = "contestLesson.contestLessonId", target = "contestLessonId")
    CodingExerciseDTO toDto(CodingExercise entity);

    @Override
    @Mapping(source = "contestLessonId", target = "contestLesson.contestLessonId")
    @Mapping(target = "courseLesson", ignore = true)
    @Mapping(target = "exerciseTestCases", ignore = true)
    CodingExercise toEntity(CodingExerciseDTO dto);

}
