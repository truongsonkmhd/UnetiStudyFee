package com.truongsonkmhd.unetistudy.service.impl.course;

import com.truongsonkmhd.unetistudy.common.EnrollmentStatus;
import com.truongsonkmhd.unetistudy.context.UserContext;
import com.truongsonkmhd.unetistudy.dto.a_common.PageResponse;
import com.truongsonkmhd.unetistudy.dto.enrollment.EnrollmentResponse;
import com.truongsonkmhd.unetistudy.model.User;
import com.truongsonkmhd.unetistudy.model.course.Course;
import com.truongsonkmhd.unetistudy.model.course.CourseEnrollment;
import com.truongsonkmhd.unetistudy.repository.UserRepository;
import com.truongsonkmhd.unetistudy.repository.course.CourseEnrollmentRepository;
import com.truongsonkmhd.unetistudy.repository.course.CourseRepository;
import com.truongsonkmhd.unetistudy.security.AuthoritiesConstants;
import com.truongsonkmhd.unetistudy.service.CourseEnrollmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.truongsonkmhd.unetistudy.cache.service.CourseCacheService;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static com.truongsonkmhd.unetistudy.security.SecurityUtils.hasCurrentUserAnyOfAuthorities;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseEnrollmentServiceImpl implements CourseEnrollmentService {

    private final CourseEnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final CourseCacheService courseCacheService;

    @Override
    @Transactional
    public EnrollmentResponse requestEnrollment(UUID courseId, String message) {
        UUID userId = UserContext.getUserID();
        if (userId == null) {
            throw new RuntimeException("User not authenticated");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Optional<CourseEnrollment> existingOpt = enrollmentRepository.findByCourse_CourseIdAndStudent_Id(courseId,
                userId);
        CourseEnrollment enrollment;

        if (existingOpt.isPresent()) {
            CourseEnrollment existing = existingOpt.get();
            if (existing.getStatus() == EnrollmentStatus.PENDING) {
                throw new RuntimeException("Yêu cầu đăng ký khóa học đã tồn tại");
            }
            if (existing.getStatus() == EnrollmentStatus.APPROVED) {
                throw new RuntimeException("Bạn đã đăng ký khóa học này");
            }
            // If REJECTED, allow re-request
            enrollment = existing;
            enrollment.setStatus(EnrollmentStatus.PENDING);
            enrollment.setRequestMessage(message);
            enrollment.setRejectionReason(null);
            // Reset creation time to appear as new request
            enrollment.setCreatedAt(Instant.now());
        } else {
            User student = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            enrollment = CourseEnrollment.builder()
                    .course(course)
                    .student(student)
                    .status(EnrollmentStatus.PENDING)
                    .requestMessage(message)
                    .build();
        }

        enrollment = enrollmentRepository.save(enrollment);
        EnrollmentResponse response = toDto(enrollment);

        // Notify teachers watching this course's enrollments
        messagingTemplate.convertAndSend("/topic/course/" + courseId + "/enrollments", response);

        return response;
    }

    @Override
    @Transactional
    public EnrollmentResponse approveEnrollment(UUID enrollmentId) {
        UUID userId = UserContext.getUserID();

        CourseEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        // Verify user is instructor
        if (!enrollment.getCourse().isOwner(userId) && !hasCurrentUserAnyOfAuthorities(AuthoritiesConstants.ADMIN, AuthoritiesConstants.SYS_ADMIN)) {
            throw new RuntimeException("Bạn không có quyền duyệt yêu cầu đăng ký khóa học này");
        }

        if (enrollment.getStatus() == EnrollmentStatus.APPROVED) {
            return toDto(enrollment);
        }

        enrollment.setStatus(EnrollmentStatus.APPROVED);
        enrollment.setApprovedAt(Instant.now());

        Course course = enrollment.getCourse();
        // Enforce capacity limit if defined
        Integer capacity = course.getCapacity();
        if (capacity != null && course.getEnrolledCount() >= capacity) {
            throw new RuntimeException("Khóa học đã đạt đủ số lượng học viên tối đa. Không thể chấp nhận thêm học viên đăng ký.");
        }
        course.setEnrolledCount(course.getEnrolledCount() + 1);
        courseRepository.save(course);
        courseCacheService.evictCourseCompletely(course.getCourseId(), course.getSlug());

        CourseEnrollment saved = enrollmentRepository.save(enrollment);
        EnrollmentResponse response = toDto(saved);

        // Notify course logic (teacher view)
        messagingTemplate.convertAndSend("/topic/course/" + course.getCourseId() + "/enrollments", response);

        return response;
    }

    @Override
    @Transactional
    public EnrollmentResponse rejectEnrollment(UUID enrollmentId, String reason) {
        UUID userId = UserContext.getUserID();

        CourseEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        // Verify user is instructor
        if (!enrollment.getCourse().isOwner(userId) && !hasCurrentUserAnyOfAuthorities(AuthoritiesConstants.ADMIN, AuthoritiesConstants.SYS_ADMIN)) {
            throw new RuntimeException("Bạn không có quyền từ chối yêu cầu đăng ký khóa học này");
        }

        // If rejecting an already approved student (revoking access), decrement count
        if (enrollment.getStatus() == EnrollmentStatus.APPROVED) {
            Course course = enrollment.getCourse();
            if (course.getEnrolledCount() > 0) {
                course.setEnrolledCount(course.getEnrolledCount() - 1);
                courseRepository.save(course);
                courseCacheService.evictCourseCompletely(course.getCourseId(), course.getSlug());
            }
        }

        enrollment.setStatus(EnrollmentStatus.REJECTED);
        enrollment.setRejectionReason(reason);

        CourseEnrollment saved = enrollmentRepository.save(enrollment);
        EnrollmentResponse response = toDto(saved);

        // Notify course logic
        messagingTemplate.convertAndSend("/topic/course/" + enrollment.getCourse().getCourseId() + "/enrollments",
                response);

        return response;
    }

    @Override
    public PageResponse<EnrollmentResponse> getCourseEnrollments(UUID courseId, EnrollmentStatus status, int page,
            int size, String q) {
        UUID userId = UserContext.getUserID();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (!course.isOwner(userId) && !hasCurrentUserAnyOfAuthorities(AuthoritiesConstants.ADMIN, AuthoritiesConstants.SYS_ADMIN)) {
            //admin , system admin có thể duyệt được không nhất thiết phải người tạo ra khóa học
            throw new RuntimeException("Bạn không có quyền xem danh sách yêu cầu đăng ký khóa học này");
        }

        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        Page<CourseEnrollment> result = enrollmentRepository.findCourseEnrollmentsWithFilter(courseId, status, q,
                pageable);

        return PageResponse.<EnrollmentResponse>builder()
                .items(result.map(this::toDto).getContent())
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .hasNext(result.hasNext())
                .build();
    }

    @Override
    public PageResponse<EnrollmentResponse> getMyEnrollments(EnrollmentStatus status, int page, int size) {
        UUID userId = UserContext.getUserID();
        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);

        Page<CourseEnrollment> result;
        if (status != null) {
            result = enrollmentRepository.findByStudent_IdAndStatus(userId, status, pageable);
        } else {
            result = enrollmentRepository.findByStudent_Id(userId, pageable);
        }

        return PageResponse.<EnrollmentResponse>builder()
                .items(result.map(this::toDto).getContent())
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .hasNext(result.hasNext())
                .build();
    }

    @Override
    public boolean isEnrolled(UUID courseId) {
        UUID userId = UserContext.getUserID();
        if (userId == null)
            return false;
        return enrollmentRepository.isStudentEnrolled(courseId, userId);
    }

    @Override
    public EnrollmentResponse getEnrollmentStatus(UUID courseId) {
        UUID userId = UserContext.getUserID();
        if (userId == null) {
            return null;
        }

        return enrollmentRepository.findByCourse_CourseIdAndStudent_Id(courseId, userId)
                .map(this::toDto)
                .orElse(null);
    }

    private EnrollmentResponse toDto(CourseEnrollment entity) {
        return EnrollmentResponse.builder()
                .enrollmentId(entity.getEnrollmentId())
                .courseId(entity.getCourse().getCourseId())
                .courseName(entity.getCourse().getTitle())
                .studentId(entity.getStudent().getId())
                .studentName(entity.getStudent().getFullName())
                .studentEmail(entity.getStudent().getEmail())
                .studentCode(entity.getStudent().getStudentProfile() != null ? entity.getStudent().getStudentProfile().getStudentId() : null)
                .status(entity.getStatus().name())
                .requestedAt(entity.getCreatedAt())
                .approvedAt(entity.getApprovedAt())
                .requestMessage(entity.getRequestMessage())
                .rejectionReason(entity.getRejectionReason())
                .build();
    }
}
