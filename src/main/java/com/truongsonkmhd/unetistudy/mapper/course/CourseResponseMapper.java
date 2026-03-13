package com.truongsonkmhd.unetistudy.mapper.course;

import com.truongsonkmhd.unetistudy.dto.course_dto.CourseTreeResponse;
import com.truongsonkmhd.unetistudy.mapper.EntityMapper;
import com.truongsonkmhd.unetistudy.model.course.Course;
import com.truongsonkmhd.unetistudy.service.infrastructure.SupabaseStorageService;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE, imports = {
        com.truongsonkmhd.unetistudy.common.YouTubeUtils.class }, uses = { CourseModuleResponseMapper.class })
public abstract class CourseResponseMapper implements EntityMapper<CourseTreeResponse, Course> {

    @Autowired
    protected SupabaseStorageService storageService;

    @Override
    @Mapping(target = "modules", source = "modules")
    @Mapping(target = "imageUrl", expression = "java(storageService.toDisplayUrl(entity.getImageUrl()))")
    @Mapping(target = "youtubeVideoId", source = "youtubeVideoId")
    @Mapping(target = "embedUrl", expression = "java(YouTubeUtils.toEmbedUrl(entity.getYoutubeVideoId()))")
    @Mapping(target = "videoUrl", expression = "java(entity.getYoutubeVideoId() != null ? YouTubeUtils.toEmbedUrl(entity.getYoutubeVideoId()) : storageService.toDisplayUrl(entity.getVideoUrl()))")
    @Mapping(target = "rating", expression = "java(entity.getRating() != null ? entity.getRating().doubleValue() : 0.0)")
    public abstract CourseTreeResponse toDto(Course entity);

    @Override
    public abstract Course toEntity(CourseTreeResponse dto);

    @Override
    @org.mapstruct.BeanMapping(nullValuePropertyMappingStrategy = org.mapstruct.NullValuePropertyMappingStrategy.IGNORE)
    public abstract void partialUpdate(@org.mapstruct.MappingTarget Course entity, CourseTreeResponse dto);
}
