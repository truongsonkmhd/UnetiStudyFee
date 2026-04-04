package com.truongsonkmhd.unetistudy.mapper.course;

import com.truongsonkmhd.unetistudy.dto.course_dto.CourseModuleRequest;
import com.truongsonkmhd.unetistudy.mapper.EntityMapper;
import com.truongsonkmhd.unetistudy.model.course.CourseModule;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CourseModuleRequestMapper extends EntityMapper<CourseModuleRequest, CourseModule> {

    @Override
    @Mapping(target = "moduleId", ignore = true)     // create mới
    @Mapping(target = "course", ignore = true)       // set ở service (course_id)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "lessons", source = "lessons")
    CourseModule toEntity(CourseModuleRequest dto);

    @Override
    CourseModuleRequest toDto(CourseModule entity);

    @Override
    List<CourseModule> toEntity(List<CourseModuleRequest> dtoList);

    @Override
    List<CourseModuleRequest> toDto(List<CourseModule> entityList);

    @Override
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void partialUpdate(@MappingTarget CourseModule entity, CourseModuleRequest dto);
}
