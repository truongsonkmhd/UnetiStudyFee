package com.truongsonkmhd.unetistudy.mapper.course;

import com.truongsonkmhd.unetistudy.dto.course_dto.CourseShowRequest;
import com.truongsonkmhd.unetistudy.mapper.EntityMapper;
import com.truongsonkmhd.unetistudy.model.course.Course;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring" )
public interface CourseRequestMapper extends EntityMapper<CourseShowRequest, Course> {

    @Override
    @Mapping(target = "courseId", ignore = true)
    @Mapping(target = "slug", ignore = true)

    // instructor set trong service theo instructorId
    @Mapping(target = "instructor", ignore = true)

    // modules thường xử lý riêng (vì mapping nested + set course reference)
    @Mapping(target = "modules", ignore = true)

    @Mapping(target = "status", ignore = true)

    //  set default hệ thống để KHÔNG bao giờ null
    @Mapping(target = "enrolledCount", constant = "0")
    @Mapping(target = "rating", expression = "java(java.math.BigDecimal.ZERO)")
    @Mapping(target = "ratingCount", constant = "0")

    // status/publish mặc định
    @Mapping(target = "isPublished", expression = "java(dto.getIsPublished() != null ? dto.getIsPublished() : false)")
    @Mapping(target = "publishedAt", expression = "java(dto.getIsPublished() != null && dto.getIsPublished() ? dto.getPublishedAt() : null)")

    // timestamps DB tự set
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Course toEntity(CourseShowRequest dto);
}
