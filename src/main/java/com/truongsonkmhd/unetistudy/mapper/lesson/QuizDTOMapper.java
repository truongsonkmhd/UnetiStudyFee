package com.truongsonkmhd.unetistudy.mapper.lesson;

import com.truongsonkmhd.unetistudy.dto.quiz_dto.QuizDTO;
import com.truongsonkmhd.unetistudy.mapper.EntityMapper;
import com.truongsonkmhd.unetistudy.model.quiz.Quiz;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", builder = @Builder(disableBuilder = true))

public interface QuizDTOMapper extends EntityMapper<QuizDTO, Quiz> {

    @Override
    @Mapping(source = "id", target = "quizId")
    @Mapping(target = "lessonId", expression = "java(entity.getCourseLessons().isEmpty() ? null : entity.getCourseLessons().get(0).getLessonId())")
    QuizDTO toDto(Quiz entity);

    @Override
    @Mapping(source = "quizId", target = "id")
    @Mapping(target = "courseLessons", ignore = true)
    @Mapping(target = "contestLessons", ignore = true)
    @Mapping(target = "questions", ignore = true)
    Quiz toEntity(QuizDTO dto);

}