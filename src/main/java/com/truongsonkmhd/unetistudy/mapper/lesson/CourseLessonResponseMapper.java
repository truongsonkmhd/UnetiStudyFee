package com.truongsonkmhd.unetistudy.mapper.lesson;

import com.truongsonkmhd.unetistudy.dto.course_dto.CourseLessonResponse;
import com.truongsonkmhd.unetistudy.mapper.EntityMapper;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.CourseLesson;
import com.truongsonkmhd.unetistudy.service.infrastructure.PocketBaseService;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import com.truongsonkmhd.unetistudy.common.LessonType;
import org.mapstruct.BeanMapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring", imports = { LessonType.class,
        com.truongsonkmhd.unetistudy.common.YouTubeUtils.class }, uses = { CodingExerciseDTOMapper.class,
                QuizDTOMapper.class })
public abstract class CourseLessonResponseMapper implements EntityMapper<CourseLessonResponse, CourseLesson> {

    @Autowired
    protected PocketBaseService pocketBaseService;

    @Override
    @Mapping(target = "youtubeVideoId", source = "youtubeVideoId")
    @Mapping(target = "embedUrl", expression = "java(YouTubeUtils.toEmbedUrl(entity.getYoutubeVideoId()))")
    @Mapping(target = "videoUrl", expression = "java(entity.getYoutubeVideoId() != null ? YouTubeUtils.toEmbedUrl(entity.getYoutubeVideoId()) : pocketBaseService.toDisplayUrl(entity.getVideoUrl()))")
    @Mapping(target = "codingExercises", source = "codingExercises")
    @Mapping(target = "quizzes", source = "quizzes")
    @Mapping(target = "totalPoints", ignore = true)
    @Mapping(target = "duration", ignore = true)
    public abstract CourseLessonResponse toDto(CourseLesson entity);

    @Override
    @Mapping(target = "lessonId", ignore = true)
    @Mapping(target = "module", ignore = true)
    @Mapping(target = "creator", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "youtubeVideoId", ignore = true)
    public abstract CourseLesson toEntity(CourseLessonResponse dto);

    @Override
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "module", ignore = true)
    @Mapping(target = "creator", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "youtubeVideoId", ignore = true)
    public abstract void partialUpdate(@MappingTarget CourseLesson entity, CourseLessonResponse dto);
}
