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
            WHERE cb.user.username = :userName AND cb.exercise.slug = :theSlug
            ORDER BY cb.submittedAt DESC
            """)
    List<CodingSubmission> getCodingSubmissionShowByUserName(@Param("userName") String theUserName,
            @Param("theSlug") String theSlug);

    @Query("""
            SELECT cb
            FROM CodingSubmission cb
            WHERE cb.exercise.slug = :theSlug
            ORDER BY cb.submittedAt DESC
            """)
    List<CodingSubmission> getCodingSubmissionShowBySlugExercise(@Param("theSlug") String theSlug);

    @Query("""
                select
                    case when count(cs) = 0 then null
                         else sum(
                                case when cs.passedTestcases = cs.totalTestcases then 1 else 0 end
                              ) * 1.0 / count(cs)
                    end
                from CodingSubmission cs
                where cs.user.id = :userId
                  and cs.exercise.courseLesson.lessonId = :lessonId
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
}
