package com.truongsonkmhd.unetistudy.repository.course;

import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.CourseLesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
@Repository
public interface CourseLessonRepository extends JpaRepository<CourseLesson, UUID> {
    @Query("""
        select l
        from CourseLesson l
        where l.module.course.courseId = :courseId
    """)
    List<CourseLesson> findLessonsByCourseId(UUID courseId);

    @Query("""
        SELECT cl
        FROM CourseLesson cl
        WHERE cl.module.moduleId = :moduleID 
    """)
    List<CourseLesson> getLessonByModuleId(@Param("moduleID") UUID moduleID);

    @Query("""
        SELECT cl
        FROM CourseLesson cl
        WHERE cl.module.moduleId = :moduleID AND cl.slug LIKE %:slug%
    """)
    List<CourseLesson> getLessonByModuleIdAndSlug(@Param("moduleID") UUID moduleID,@Param("slug")String slug);

    boolean existsBySlug(String slug);
}
