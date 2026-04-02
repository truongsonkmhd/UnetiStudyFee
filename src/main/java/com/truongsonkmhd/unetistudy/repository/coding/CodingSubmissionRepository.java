package com.truongsonkmhd.unetistudy.repository.coding;

import com.truongsonkmhd.unetistudy.model.lesson.CodingSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CodingSubmissionRepository extends JpaRepository<CodingSubmission, UUID> {
  @Query("""
      SELECT cb
      FROM CodingSubmission cb
      WHERE cb.user.username = :userName AND cb.exercise.exerciseId = :exerciseId
      ORDER BY cb.submittedAt DESC
      """)
  List<CodingSubmission> getCodingSubmissionShowByUserName(@Param("userName") String theUserName,
      @Param("exerciseId") UUID exerciseId);

  @Query("""
      SELECT cb
      FROM CodingSubmission cb
      WHERE cb.exercise.exerciseId = :exerciseId
      ORDER BY cb.submittedAt DESC
      """)
  List<CodingSubmission> getCodingSubmissionShowByExerciseId(@Param("exerciseId") UUID exerciseId);

  @Query("""
          select
              case when count(cs) = 0 then null
                   else sum(
                          case when cs.passedTestcases = cs.totalTestcases then 1 else 0 end
                        ) * 1.0 / count(cs)
              end
          from CodingSubmission cs
          where cs.user.id = :userId
            and cs.exercise.exerciseId IN (
              SELECT e.exerciseId FROM CourseLesson cl JOIN cl.codingExercises e WHERE cl.lessonId = :lessonId
            )
      """)
  Double acRate(
      @Param("userId") UUID userId,
      @Param("lessonId") UUID lessonId);

  @Query("""
          select cs
          from CodingSubmission cs
          where cs.submissionId = :id
      """)
  Optional<CodingSubmission> findByIdEntity(@Param("id") UUID id);

  @Modifying
  @Query("DELETE FROM CodingSubmission cs WHERE cs.exercise.exerciseId = :exerciseId")
  void deleteByExerciseId(@Param("exerciseId") UUID exerciseId);

  @Query("SELECT COUNT(cs) > 0 FROM CodingSubmission cs WHERE cs.exercise.exerciseId IN (SELECT e.exerciseId FROM CourseLesson cl JOIN cl.codingExercises e WHERE cl.lessonId = :lessonId)")
  boolean existsByExerciseCourseLessonLessonId(@Param("lessonId") UUID lessonId);

  @Query("SELECT COUNT(cs) > 0 FROM CodingSubmission cs WHERE cs.exercise.exerciseId IN (SELECT e.exerciseId FROM CourseLesson cl JOIN cl.codingExercises e WHERE cl.module.moduleId = :moduleId)")
  boolean existsByExerciseCourseLessonModuleModuleId(@Param("moduleId") UUID moduleId);

  /**
   * Tìm bài nộp coding có điểm cao nhất của user cho 1 exercise
   * Dùng khi chấm điểm contest: lấy điểm tốt nhất student đã đạt được
   */
  @Query("""
      SELECT cs FROM CodingSubmission cs
      WHERE cs.user.id = :userId
        AND cs.exercise.exerciseId = :exerciseId
      ORDER BY cs.score DESC, cs.submittedAt DESC
      """)
  List<CodingSubmission> findBestByUserAndExercise(
      @Param("userId") UUID userId,
      @Param("exerciseId") UUID exerciseId);

  // ===== Analytics by class scope =====

  /**
   * Tỉ lệ pass coding và số lần submit của mỗi student trong danh sách courses.
   * Returns: [userId (UUID), passRate (Double), submitCount (Long)]
   */
  @Query("""
      select cs.user.id,
             avg(case when cs.passedTestcases = cs.totalTestcases then 1.0 else 0.0 end),
             count(cs)
      from CodingSubmission cs
      where cs.user.id in :studentIds
        and cs.exercise.exerciseId in (
            select e.exerciseId from CourseLesson cl
            join cl.codingExercises e
            where cl.module.course.courseId in :courseIds
        )
      group by cs.user.id
      """)
  List<Object[]> codePassRateByStudents(
      @Param("studentIds") List<UUID> studentIds,
      @Param("courseIds") List<UUID> courseIds);

  /**
   * Tỉ lệ pass coding và số lần submit của mỗi student theo từng course.
   * Returns: [userId (UUID), courseId (UUID), passRate (Double), submitCount (Long)]
   */
  @Query("""
      select cs.user.id,
             cl.module.course.courseId,
             avg(case when cs.passedTestcases = cs.totalTestcases then 1.0 else 0.0 end),
             count(cs)
      from CodingSubmission cs
      join CourseLesson cl on cs.exercise.exerciseId in
           (select e.exerciseId from CourseLesson cl2 join cl2.codingExercises e
            where cl2.lessonId = cl.lessonId)
      where cs.user.id in :studentIds
        and cl.module.course.courseId in :courseIds
      group by cs.user.id, cl.module.course.courseId
      """)
  List<Object[]> codePassRatePerStudentPerCourse(
      @Param("studentIds") List<UUID> studentIds,
      @Param("courseIds") List<UUID> courseIds);
}
