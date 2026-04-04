package com.truongsonkmhd.unetistudy.service;

import com.truongsonkmhd.unetistudy.dto.a_common.PageResponse;
import com.truongsonkmhd.unetistudy.dto.course_dto.CourseCardResponse;
import com.truongsonkmhd.unetistudy.dto.course_dto.CourseModuleResponse;
import com.truongsonkmhd.unetistudy.dto.course_dto.CourseShowRequest;
import com.truongsonkmhd.unetistudy.dto.course_dto.CourseTreeResponse;

import java.util.List;
import java.util.UUID;

public interface CourseTreeService {
    CourseTreeResponse findById(UUID theId);

    CourseTreeResponse save(CourseShowRequest theCourseRequest);

    CourseTreeResponse update(UUID courseId, CourseShowRequest req);

    CourseTreeResponse getCourseTreeDetailPublished(String slug);

    UUID deleteById(UUID theId);

    List<CourseModuleResponse> getCourseModuleByCourseSlug(String theSlug);

    PageResponse<CourseCardResponse> getAllCourses(
            Integer page, Integer size, String q, String status, String category);
}
