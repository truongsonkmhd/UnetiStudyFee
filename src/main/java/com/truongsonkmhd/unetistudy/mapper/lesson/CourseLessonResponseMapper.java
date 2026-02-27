package com.truongsonkmhd.unetistudy.mapper.lesson;

import com.truongsonkmhd.unetistudy.dto.course_dto.CourseLessonResponse;
import com.truongsonkmhd.unetistudy.mapper.EntityMapper;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.CourseLesson;
import com.truongsonkmhd.unetistudy.service.infrastructure.PocketBaseService;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import com.truongsonkmhd.unetistudy.common.LessonType;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring", imports = { LessonType.class }, uses = { CodingExerciseDTOMapper.class,
        QuizDTOMapper.class })
public abstract class CourseLessonResponseMapper implements EntityMapper<CourseLessonResponse, CourseLesson> {

    @Autowired
    protected PocketBaseService pocketBaseService;

    @Override
    @Mapping(target = "videoUrl", expression = "java(pocketBaseService.toDisplayUrl(entity.getVideoUrl()))")
    @Mapping(target = "codingExercises", source = "codingExercises")
    @Mapping(target = "quizzes", source = "quizzes")
    public abstract CourseLessonResponse toDto(CourseLesson entity);

    @Override
    @Mapping(target = "lessonId", ignore = true)
    @Mapping(target = "module", ignore = true)
    @Mapping(target = "creator", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "slug", ignore = true)
    public abstract CourseLesson toEntity(CourseLessonResponse dto);
}
