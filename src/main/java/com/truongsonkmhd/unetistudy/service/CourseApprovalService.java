package com.truongsonkmhd.unetistudy.service;

import com.truongsonkmhd.unetistudy.model.course.Course;

import java.util.List;
import java.util.UUID;

public interface CourseApprovalService {

    Boolean submitForApproval(UUID courseId, String note);

    Boolean reject(UUID courseId, String reason);

    Boolean approve(UUID courseId, String note);

    List<Course> getListCourseByStatus();
}
