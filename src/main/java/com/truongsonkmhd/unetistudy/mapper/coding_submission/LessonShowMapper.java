package com.truongsonkmhd.unetistudy.mapper.coding_submission;

import com.truongsonkmhd.unetistudy.dto.lesson_dto.LessonShowDTO;
import com.truongsonkmhd.unetistudy.mapper.EntityMapper;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.CourseLesson;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LessonShowMapper extends EntityMapper<LessonShowDTO, CourseLesson> {

    @Override
    @Mapping(source = "lessonId", target = "lessonID")
    @Mapping(source = "module.moduleId", target = "moduleID")
    LessonShowDTO toDto(CourseLesson entity);

    @Override
    @Mapping(source = "lessonID", target = "lessonId")
    @Mapping(source = "moduleID", target = "module.moduleId")
    @Mapping(target = "module", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    CourseLesson toEntity(LessonShowDTO dto);
}
