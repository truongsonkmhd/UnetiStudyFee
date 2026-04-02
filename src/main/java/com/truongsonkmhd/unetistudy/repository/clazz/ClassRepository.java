package com.truongsonkmhd.unetistudy.repository.clazz;

import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.Clazz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.truongsonkmhd.unetistudy.dto.class_dto.ClassQuickSearchResponse;

@Repository
public interface ClassRepository extends JpaRepository<Clazz, UUID> {
    Optional<Clazz> findByInviteCode(String inviteCode);
    Optional<Clazz> findByClassCode(String classCode);
    List<Clazz> findByStudents_Id(UUID studentId);
    List<Clazz> findByInstructor_IdOrderByCreatedAtDesc(UUID instructorId);
    boolean existsByClassIdAndStudents_Id(UUID classId, UUID studentId);
    boolean existsByClassName(String className);

    @Query("SELECT COUNT(s) FROM Clazz c JOIN c.students s WHERE c.classId = :classId")
    long countStudentsInClass(@Param("classId") UUID classId);
    @Query("""
        select new com.truongsonkmhd.unetistudy.dto.class_dto.ClassQuickSearchResponse(
            c.classId, c.className, c.classCode, c.instructor.fullName, c.inviteCode
        )
        from Clazz c
        where lower(c.className) like lower(concat('%', cast(:q as string), '%'))
           or lower(c.classCode) like lower(concat('%', cast(:q as string), '%'))
        order by c.createdAt desc
    """)
    List<ClassQuickSearchResponse> instantSearch(@Param("q") String q, Pageable pageable);
}