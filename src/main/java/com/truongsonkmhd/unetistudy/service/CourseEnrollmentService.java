package com.truongsonkmhd.unetistudy.service;

import com.truongsonkmhd.unetistudy.common.EnrollmentStatus;
import com.truongsonkmhd.unetistudy.dto.a_common.PageResponse;
import com.truongsonkmhd.unetistudy.dto.enrollment.EnrollmentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface CourseEnrollmentService {

    EnrollmentResponse requestEnrollment(UUID courseId, String message);

    EnrollmentResponse approveEnrollment(UUID enrollmentId);

    EnrollmentResponse rejectEnrollment(UUID enrollmentId, String reason);

    PageResponse<EnrollmentResponse> getCourseEnrollments(UUID courseId, EnrollmentStatus status, int page, int size,
            String q);

    PageResponse<EnrollmentResponse> getMyEnrollments(EnrollmentStatus status, int page, int size);

    boolean isEnrolled(UUID courseId);

    EnrollmentResponse getEnrollmentStatus(UUID courseId);
}
