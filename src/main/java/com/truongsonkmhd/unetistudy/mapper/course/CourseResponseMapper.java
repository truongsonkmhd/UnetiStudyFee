package com.truongsonkmhd.unetistudy.mapper.course;

import com.truongsonkmhd.unetistudy.dto.course_dto.CourseTreeResponse;
import com.truongsonkmhd.unetistudy.mapper.EntityMapper;
import com.truongsonkmhd.unetistudy.model.course.Course;
import com.truongsonkmhd.unetistudy.service.infrastructure.PocketBaseService;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring", uses = { CourseModuleResponseMapper.class })
public abstract class CourseResponseMapper implements EntityMapper<CourseTreeResponse, Course> {

    @Autowired
    protected PocketBaseService pocketBaseService;

    @Override
    @Mapping(target = "modules", source = "modules")
    @Mapping(target = "imageUrl", expression = "java(pocketBaseService.toDisplayUrl(entity.getImageUrl()))")
    @Mapping(target = "videoUrl", expression = "java(pocketBaseService.toDisplayUrl(entity.getVideoUrl()))")
    @Mapping(target = "rating", expression = "java(entity.getRating() != null ? entity.getRating().doubleValue() : 0.0)")
    public abstract CourseTreeResponse toDto(Course entity);

    @Override
    @Mapping(target = "courseId", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "shortDescription", ignore = true)
    @Mapping(target = "instructor", ignore = true)
    @Mapping(target = "level", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "subCategory", ignore = true)
    @Mapping(target = "capacity", ignore = true)
    @Mapping(target = "enrolledCount", ignore = true)
    @Mapping(target = "rating", ignore = true)
    @Mapping(target = "ratingCount", ignore = true)
    @Mapping(target = "imageUrl", ignore = true)
    @Mapping(target = "videoUrl", ignore = true)
    @Mapping(target = "requirements", ignore = true)
    @Mapping(target = "objectives", ignore = true)
    @Mapping(target = "syllabus", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "publishedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    public abstract Course toEntity(CourseTreeResponse dto);
}
