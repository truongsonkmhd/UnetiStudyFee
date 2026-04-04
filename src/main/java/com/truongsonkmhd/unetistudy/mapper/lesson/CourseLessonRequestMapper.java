package com.truongsonkmhd.unetistudy.mapper.lesson;

import com.truongsonkmhd.unetistudy.common.LessonType;
import com.truongsonkmhd.unetistudy.dto.lesson_dto.CourseLessonRequest;
import com.truongsonkmhd.unetistudy.mapper.EntityMapper;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.CourseLesson;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", imports = { LessonType.class } ,
        uses = CodingExerciseDTOMapper.class
)
public interface CourseLessonRequestMapper extends EntityMapper<CourseLessonRequest, CourseLesson> {

    @Override
    CourseLessonRequest toDto(CourseLesson entity);

    @Override
    @Mapping(target = "lessonId", ignore = true)
    @Mapping(target = "module", ignore = true)
    @Mapping(target = "creator", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "slug", ignore = true)
    CourseLesson toEntity(CourseLessonRequest dto);
}
