package com.truongsonkmhd.unetistudy.service;

import com.truongsonkmhd.unetistudy.dto.course_dto.CourseLessonResponse;
import com.truongsonkmhd.unetistudy.dto.lesson_dto.CourseLessonRequest;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.CourseLesson;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CourseLessonService {
    List<CourseLessonResponse> getLessonByModuleId(UUID moduleId);

    List<CourseLessonResponse> getLessonByModuleIDAndSlug(UUID moduleID, String slug);

    List<CourseLessonResponse> getLessonAll();

    CourseLessonResponse addLesson(CourseLessonRequest request);

    CourseLessonResponse update(UUID theId, CourseLessonRequest request);

    Optional<CourseLesson> findById(UUID id);

    UUID delete(UUID theId);

    boolean hasSubmissions(UUID lessonId);
}
