package com.truongsonkmhd.unetistudy.repository.course;

import com.truongsonkmhd.unetistudy.model.lesson.LessonProgress;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, UUID> {

    @Query("""
                select lp
                from LessonProgress lp
                where lp.user.id = :userId
                  and lp.course.courseId = :courseId
            """)
    List<LessonProgress> findByUserAndCourse(
            @Param("userId") UUID userId,
            @Param("courseId") UUID courseId);

    @Query("""
                select lp
                from LessonProgress lp
                where lp.user.id = :userId
                  and lp.course.courseId = :courseId
                  and lp.lesson.lessonId = :lessonId
                order by lp.updatedAt desc
                limit 1
            """)
    Optional<LessonProgress> findByUserAndCourseAndLesson(
            @Param("userId") UUID userId,
            @Param("courseId") UUID courseId,
            @Param("lessonId") UUID lessonId);

    @Query("""
                select lp
                from LessonProgress lp
                left join fetch lp.lesson l
                left join fetch l.module m
                where lp.user.id = :userId
                  and lp.course.courseId = :courseId
                order by lp.lastAccessAt desc
                limit 1
            """)
    Optional<LessonProgress> findLastAccessedLesson(
            @Param("userId") UUID userId,
            @Param("courseId") UUID courseId);

    // ===== Analytics by class scope =====

    /**
     * Đếm số bài học hoàn thành của mỗi student trong danh sách courses.
     * Returns: [studentId (UUID), completedCount (Long)]
     */
    @Query("""
                select lp.user.id, count(lp)
                from LessonProgress lp
                where lp.user.id in :studentIds
                  and lp.course.courseId in :courseIds
                  and lp.status = ProgressStatus.DONE
                group by lp.user.id
            """)
    List<Object[]> countCompletedByStudentsAndCourses(
            @Param("studentIds") List<UUID> studentIds,
            @Param("courseIds") List<UUID> courseIds);

    /**
     * Tìm ngày cuối truy cập của mỗi student trong danh sách courses.
     * Returns: [studentId (UUID), lastAccessAt (Instant)]
     */
    @Query("""
                select lp.user.id, max(lp.lastAccessAt)
                from LessonProgress lp
                where lp.user.id in :studentIds
                  and lp.course.courseId in :courseIds
                group by lp.user.id
            """)
    List<Object[]> findLastAccessByStudents(
            @Param("studentIds") List<UUID> studentIds,
            @Param("courseIds") List<UUID> courseIds);

    /**
     * Đếm tổng số lessons trong danh sách courses (mẫu số cho completion_rate).
     */
    @Query("""
                select count(cl)
                from CourseLesson cl
                where cl.module.course.courseId in :courseIds
            """)
    Long countTotalLessonsByCourses(@Param("courseIds") List<UUID> courseIds);
}
