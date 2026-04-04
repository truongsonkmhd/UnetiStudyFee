package com.truongsonkmhd.unetistudy.service.impl.course;

import com.truongsonkmhd.unetistudy.common.CourseStatus;
import com.truongsonkmhd.unetistudy.context.UserContext;
import com.truongsonkmhd.unetistudy.model.User;
import com.truongsonkmhd.unetistudy.model.course.Course;
import com.truongsonkmhd.unetistudy.model.course.CourseApproval;
import com.truongsonkmhd.unetistudy.repository.course.CourseApprovalRepository;
import com.truongsonkmhd.unetistudy.repository.course.CourseRepository;
import com.truongsonkmhd.unetistudy.repository.UserRepository;
import com.truongsonkmhd.unetistudy.service.CourseApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor

public class CourseApprovalServiceImpl implements CourseApprovalService {
    private final CourseRepository courseRepository;
    private final CourseApprovalRepository approvalRepository;
    private final UserRepository userRepository; // hoặc lấy từ context

    @Override
    public List<Course> getListCourseByStatus() {
        return courseRepository.findByStatus(CourseStatus.PENDING_APPROVAL);
    }

    private Course getSourceByCourseId(UUID courseId) {
        return courseRepository.findById(courseId).orElseThrow(() -> new RuntimeException("Course not found"));
    }

    @Transactional
    @Override
    public Boolean submitForApproval(UUID courseId, String note) {
        Course c = getSourceByCourseId(courseId);

        UUID currentUserId = UserContext.getUserID();
        if (!c.isOwner(currentUserId)) {
            throw new RuntimeException("You are not owner of this course");
        }

        if (c.getStatus() == CourseStatus.PENDING_APPROVAL) {
            throw new RuntimeException("Course is already pending approval");
        }
        if (c.getStatus() == CourseStatus.APPROVED) {
            // tuỳ business: cho submit lại khi sửa -> chuyển về pending
            // hoặc bắt buộc admin duyệt lại nếu chỉnh sửa nội dung
        }

        User actor = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CourseStatus from = c.getStatus();
        c.setStatus(CourseStatus.PENDING_APPROVAL);
        c.setSubmittedAt(Instant.now());
        c.setSubmittedBy(actor);

        // khi pending thì chưa publish
        c.setIsPublished(false);
        c.setPublishedAt(null);
        c.setRejectedReason(null);

        courseRepository.save(c);

        approvalRepository.save(CourseApproval.builder()
                .course(c)
                .fromStatus(from)
                .toStatus(CourseStatus.PENDING_APPROVAL)
                .actor(actor)
                .note(note)
                .build());

        return true;
    }

    @Transactional
    @Override
    public Boolean approve(UUID courseId, String note) {
        Course c = getSourceByCourseId(courseId);

        if (c.getStatus() != CourseStatus.PENDING_APPROVAL) {
            throw new RuntimeException("Course is not pending approval");
        }

        UUID adminId = UserContext.getUserID();
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CourseStatus from = c.getStatus();
        c.setStatus(CourseStatus.APPROVED);

        c.setApprovedAt(Instant.now());
        c.setApprovedBy(admin);

        // duyệt xong mới publish (hoặc tách approve và publish tuỳ bạn)
        c.setIsPublished(true);
        c.setPublishedAt(LocalDateTime.now());

        c.setRejectedReason(null);

        courseRepository.save(c);

        approvalRepository.save(CourseApproval.builder()
                .course(c)
                .fromStatus(from)
                .toStatus(CourseStatus.APPROVED)
                .actor(admin)
                .note(note)
                .build());

        return true;
    }

    @Transactional
    @Override
    public Boolean reject(UUID courseId, String reason) {
        Course c = getSourceByCourseId(courseId);

        if (c.getStatus() != CourseStatus.PENDING_APPROVAL) {
            throw new RuntimeException("Course is not pending approval");
        }

        UUID adminId = UserContext.getUserID();
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CourseStatus from = c.getStatus();
        c.setStatus(CourseStatus.REJECTED);
        c.setRejectedReason(reason);

        // reject thì chắc chắn không publish
        c.setIsPublished(false);
        c.setPublishedAt(null);

        courseRepository.save(c);

        approvalRepository.save(CourseApproval.builder()
                .course(c)
                .fromStatus(from)
                .toStatus(CourseStatus.REJECTED)
                .actor(admin)
                .note(reason)
                .build());

        return true;
    }

}
