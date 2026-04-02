package com.truongsonkmhd.unetistudy.repository.course;

import com.truongsonkmhd.unetistudy.common.EnrollmentStatus;
import com.truongsonkmhd.unetistudy.model.course.CourseEnrollment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, UUID> {

    Optional<CourseEnrollment> findByCourse_CourseIdAndStudent_Id(UUID courseId, UUID studentId);

    boolean existsByCourse_CourseIdAndStudent_Id(UUID courseId, UUID studentId);

    // Check if student is actively enrolled (APPROVED)
    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM CourseEnrollment e " +
            "WHERE e.course.courseId = :courseId AND e.student.id = :studentId AND e.status = 'APPROVED'")
    boolean isStudentEnrolled(@Param("courseId") UUID courseId, @Param("studentId") UUID studentId);

    // List enrollments for a course (for teacher)
    Page<CourseEnrollment> findByCourse_CourseId(UUID courseId, Pageable pageable);

    // Filter by status (e.g., list pending requests)
    Page<CourseEnrollment> findByCourse_CourseIdAndStatus(UUID courseId, EnrollmentStatus status, Pageable pageable);

    // List enrollments for a student (My Courses)
    Page<CourseEnrollment> findByStudent_Id(UUID studentId, Pageable pageable);

    Page<CourseEnrollment> findByStudent_IdAndStatus(UUID studentId, EnrollmentStatus status, Pageable pageable);

    @Modifying
    @Transactional
    @Query("UPDATE CourseEnrollment e SET e.status = :status, e.approvedAt = CURRENT_TIMESTAMP WHERE e.enrollmentId = :id")
    void updateStatus(@Param("id") UUID id, @Param("status") EnrollmentStatus status);

    @Query("SELECT e FROM CourseEnrollment e WHERE e.course.courseId = :courseId " +
            "AND (:status IS NULL OR e.status = :status) " +
            "AND (:q IS NULL OR lower(e.student.fullName) LIKE lower(concat('%', cast(:q as string), '%')) OR lower(e.student.email) LIKE lower(concat('%', cast(:q as string), '%')))")
    Page<CourseEnrollment> findCourseEnrollmentsWithFilter(@Param("courseId") UUID courseId,
            @Param("status") EnrollmentStatus status, @Param("q") String q, Pageable pageable);

    /**
     * Lấy danh sách (studentId, courseId) cho các sinh viên đã APPROVED enroll.
     * Dùng cho AI Analytics để biết sinh viên nào đã tham gia khóa học nào.
     * Returns: [studentId (UUID), courseId (UUID)]
     */
    @Query("SELECT e.student.id, e.course.courseId FROM CourseEnrollment e " +
            "WHERE e.student.id IN :studentIds " +
            "AND e.course.courseId IN :courseIds " +
            "AND e.status = 'APPROVED'")
    List<Object[]> findEnrolledCoursesByStudents(
            @Param("studentIds") List<UUID> studentIds,
            @Param("courseIds") List<UUID> courseIds);
}
