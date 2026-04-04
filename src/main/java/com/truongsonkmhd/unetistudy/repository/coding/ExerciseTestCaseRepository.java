package com.truongsonkmhd.unetistudy.repository.coding;


import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.ExerciseTestCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Set;
import java.util.UUID;

@Repository
public interface ExerciseTestCaseRepository extends JpaRepository<ExerciseTestCase, UUID> {
    @Query("""
            SELECT et
            FROM ExerciseTestCase et 
            WHERE et.codingExercise.exerciseId = :theID
            """)
        Set<ExerciseTestCase> getExerciseTestCasesDTOByExerciseID(@Param("theID") UUID exerciseID);
}