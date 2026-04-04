package com.truongsonkmhd.unetistudy.repository.course;

import com.truongsonkmhd.unetistudy.model.course.CourseModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
@Repository
public interface CourseModuleRepository extends JpaRepository<CourseModule, UUID> {

    @Query("""
    select cm
    from CourseModule cm
    where cm.course.courseId = :courseId
""")
    List<CourseModule> findModulesByCourseId(UUID courseId);


    @Query("SELECT cm FROM CourseModule cm WHERE cm.course.slug = :slug")
    List<CourseModule> getCourseModuleByCourseSlug(@Param("slug") String slug);

    Optional<CourseModule> findBySlug(String slug);

}
