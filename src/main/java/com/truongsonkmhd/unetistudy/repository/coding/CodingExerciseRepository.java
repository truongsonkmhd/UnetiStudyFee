package com.truongsonkmhd.unetistudy.repository.coding;

import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.CodingExercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CodingExerciseRepository extends JpaRepository<CodingExercise, UUID> {

    @Query("""
                SELECT e
                FROM CodingExercise e
                WHERE e.courseLesson.lessonId IN :lessonIds
            """)
    List<CodingExercise> findExercisesByLessonIds(@Param("lessonIds") List<UUID> lessonIds);

    @Query("""
                SELECT DISTINCT ce
                FROM CodingExercise ce
                LEFT JOIN FETCH ce.exerciseTestCases
                WHERE ce.courseLesson.slug = :slug
            """)
    List<CodingExercise> findByLessonSlugWithTestCases(@Param("slug") String slug);

    @Query("""
                SELECT ce
                FROM CodingExercise ce
                WHERE ce.courseLesson.slug = :slug
            """)
    CodingExercise findDetailByLessonSlug(@Param("slug") String slug);

    @Query("""
                SELECT ce
                FROM CodingExercise ce
                WHERE ce.exerciseId = :exerciseId
            """)
    CodingExercise getExerciseEntityById(@Param("exerciseId") UUID exerciseId);

    @Query("""
                SELECT ce.courseLesson.lessonId
                FROM CodingExercise ce
                WHERE ce.exerciseId = :exerciseId
            """)
    UUID getLessonIDByExerciseID(@Param("exerciseId") UUID exerciseId);
}
