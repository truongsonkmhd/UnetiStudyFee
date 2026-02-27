package com.truongsonkmhd.unetistudy.repository.course;

import com.truongsonkmhd.unetistudy.dto.course_module.CourseModuleFILLDTO;
import com.truongsonkmhd.unetistudy.dto.lesson_dto.*;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.CourseLesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LessonRepository extends JpaRepository<CourseLesson, UUID> {
    @Query("""
                select l
                from CourseLesson l
                join fetch l.module m
                where m.moduleId in :moduleIds
            """)
    List<CourseLesson> findLessonsByModuleIds(List<UUID> moduleIds);

    // Lấy ra những lesson/contest với username
    @Query("""
                SELECT cl
                FROM CourseLesson cl
                WHERE cl.module.moduleId = :moduleID AND cl.creator.username = :userName
            """)
    List<ContestManagementShowDTO> getContestManagementShowDTO(@Param("moduleID") UUID moduleID,
            @Param("userName") String userName);

    // lấy ra các trường có thể chỉnh sửa của lesson theo slug
    @Query("""
                SELECT cl
                FROM CourseLesson cl
                WHERE cl.module.moduleId = :moduleID AND cl.slug = :theSlug
            """)
    EditLessonDTO getEditLessonDTO(@Param("moduleID") UUID moduleID, @Param("slug") String slug);

    // Hàm này tương đương: SELECT COUNT(*) > 0 FROM courselesson WHERE slug = :slug
    boolean existsBySlug(String slug);

    @Query("select cm " +
            "from CourseModule cm " +
            "join cm.course c " +
            "join c.instructor u " +
            "where u.username = :userName")
    List<CourseModuleFILLDTO> findModulesByInstructorUserName(@Param("username") String userName);

    @Query("""
                select l
                from CourseLesson l
                join l.module m
                where m.course.courseId = :courseId
            """)
    List<CourseLesson> findByCourseId(@Param("courseId") UUID courseId);

}
