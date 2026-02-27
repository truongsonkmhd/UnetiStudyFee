package com.truongsonkmhd.unetistudy.mapper.lesson;

import com.truongsonkmhd.unetistudy.dto.quiz_dto.QuizDTO;
import com.truongsonkmhd.unetistudy.mapper.EntityMapper;
import com.truongsonkmhd.unetistudy.model.quiz.Quiz;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface QuizDTOMapper extends EntityMapper<QuizDTO, Quiz> {

    @Override
    @Mapping(source = "id", target = "quizId")
    @Mapping(source = "courseLesson.lessonId", target = "lessonId")
    QuizDTO toDto(Quiz entity);

    @Override
    @Mapping(source = "quizId", target = "id")
    @Mapping(source = "lessonId", target = "courseLesson.lessonId")
    @Mapping(target = "questions", ignore = true)
    @Mapping(target = "contestLesson", ignore = true)
    Quiz toEntity(QuizDTO dto);
}