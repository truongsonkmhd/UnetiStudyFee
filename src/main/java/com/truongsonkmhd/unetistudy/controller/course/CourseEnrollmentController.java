package com.truongsonkmhd.unetistudy.controller.course;

import com.truongsonkmhd.unetistudy.common.EnrollmentStatus;
import com.truongsonkmhd.unetistudy.dto.a_common.IResponseMessage;
import com.truongsonkmhd.unetistudy.dto.enrollment.EnrollmentApprovalRequest;
import com.truongsonkmhd.unetistudy.dto.a_common.PageResponse;
import com.truongsonkmhd.unetistudy.dto.a_custom.ApiResponse;
import com.truongsonkmhd.unetistudy.dto.a_common.ResponseMessage;
import com.truongsonkmhd.unetistudy.dto.enrollment.EnrollmentResponse;
import com.truongsonkmhd.unetistudy.service.CourseEnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class CourseEnrollmentController {

    private final CourseEnrollmentService enrollmentService;

    @PostMapping("/request/{courseId}")
    public ResponseEntity<IResponseMessage> requestEnrollment(
            @PathVariable UUID courseId,
            @RequestBody(required = false) String message) {
        return ResponseEntity.ok(ResponseMessage.created(enrollmentService.requestEnrollment(courseId, message)));
    }

    @PostMapping("/approve/{enrollmentId}")
    public ResponseEntity<IResponseMessage> approveEnrollment(@PathVariable UUID enrollmentId) {
        return ResponseEntity.ok(ResponseMessage.updated(enrollmentService.approveEnrollment(enrollmentId)));
    }

    @PostMapping("/reject/{enrollmentId}")
    public ResponseEntity<IResponseMessage> rejectEnrollment(
            @PathVariable UUID enrollmentId,
            @RequestBody(required = false) EnrollmentApprovalRequest request) {
        String reason = request != null ? request.getReason() : null;
        return ResponseEntity.ok(ResponseMessage.updated(enrollmentService.rejectEnrollment(enrollmentId, reason)));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<IResponseMessage> getCourseEnrollments(
            @PathVariable UUID courseId,
            @RequestParam(required = false) EnrollmentStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String q) {
        return ResponseEntity
                .ok(ResponseMessage.ok(enrollmentService.getCourseEnrollments(courseId, status, page, size, q)));
    }

    @GetMapping("/my-enrollments")
    public ResponseEntity<IResponseMessage> getMyEnrollments(
            @RequestParam(required = false) EnrollmentStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ResponseMessage.ok(enrollmentService.getMyEnrollments(status, page, size)));
    }

    @GetMapping("/check/{courseId}")
    public ResponseEntity<IResponseMessage> isEnrolled(@PathVariable UUID courseId) {
        return ResponseEntity.ok(ResponseMessage.ok(enrollmentService.isEnrolled(courseId)));
    }

    @GetMapping("/status/{courseId}")
    public ResponseEntity<IResponseMessage> getEnrollmentStatus(@PathVariable UUID courseId) {
        return ResponseEntity.ok(ResponseMessage.ok(enrollmentService.getEnrollmentStatus(courseId)));
    }
}
