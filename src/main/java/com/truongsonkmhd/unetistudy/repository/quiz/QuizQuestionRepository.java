package com.truongsonkmhd.unetistudy.repository.quiz;

import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.ContestLesson;
import com.truongsonkmhd.unetistudy.model.quiz.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuizQuestionRepository extends JpaRepository<Quiz, UUID> {
    @Query("""
                SELECT q
                FROM ContestLesson cl
                JOIN cl.quizzes q
                WHERE cl = :contestLesson AND q.isPublished = true
            """)
    List<Quiz> findByContestLessonAndIsPublishedTrue(@Param("contestLesson") ContestLesson contestLesson);

    Optional<Quiz> findByTemplateId(UUID templateId);
}
