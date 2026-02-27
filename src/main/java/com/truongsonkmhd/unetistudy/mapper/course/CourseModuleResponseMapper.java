package com.truongsonkmhd.unetistudy.mapper.course;

import com.truongsonkmhd.unetistudy.dto.course_dto.CourseModuleResponse;
import com.truongsonkmhd.unetistudy.mapper.EntityMapper;
import com.truongsonkmhd.unetistudy.mapper.lesson.CourseLessonResponseMapper;
import com.truongsonkmhd.unetistudy.model.course.CourseModule;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring",uses = {CourseLessonResponseMapper.class} )
public interface CourseModuleResponseMapper extends EntityMapper<CourseModuleResponse, CourseModule> {

    @Override
    CourseModuleResponse toDto(CourseModule entity);

    @Override
    @Mapping(target = "course", ignore = true)
    CourseModule toEntity(CourseModuleResponse dto);


}
