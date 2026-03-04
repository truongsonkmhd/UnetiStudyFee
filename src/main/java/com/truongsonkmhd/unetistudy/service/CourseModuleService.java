package com.truongsonkmhd.unetistudy.service;

import com.truongsonkmhd.unetistudy.dto.course_dto.CourseModuleRequest;
import com.truongsonkmhd.unetistudy.dto.course_dto.CourseModuleResponse;

import java.util.List;
import java.util.UUID;

public interface CourseModuleService {
    List<CourseModuleResponse> getAllModule();

    CourseModuleResponse update(UUID theId, CourseModuleRequest request);

    UUID delete(UUID theId);

    boolean hasSubmissions(UUID moduleId);
}
