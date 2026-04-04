package com.truongsonkmhd.unetistudy.repository.course;

import com.truongsonkmhd.unetistudy.model.course.CourseApproval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
@Repository
public interface CourseApprovalRepository extends JpaRepository<CourseApproval, UUID> {
    List<CourseApproval> findByCourse_CourseIdOrderByCreatedAtDesc(UUID courseId);
}
