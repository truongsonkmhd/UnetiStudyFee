package com.truongsonkmhd.unetistudy.repository.quiz;

import com.truongsonkmhd.unetistudy.model.quiz.Quiz;
import com.truongsonkmhd.unetistudy.model.quiz.UserQuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserQuizAttemptRepository extends JpaRepository<UserQuizAttempt, UUID> {
    @Query("SELECT DISTINCT a FROM UserQuizAttempt a LEFT JOIN FETCH a.quiz LEFT JOIN FETCH a.userAnswers WHERE a.userId = :userId AND a.quiz = :quiz ORDER BY a.createdAt DESC")
    List<UserQuizAttempt> findByUserIdAndQuizOrderByCreatedAtDesc(@Param("userId") UUID userId,
            @Param("quiz") Quiz quiz);

    long countByUserIdAndQuiz(UUID userId, Quiz quiz);

    @Query("SELECT a FROM UserQuizAttempt a WHERE a.userId = :userId AND a.quiz = :quiz AND a.status = 'IN_PROGRESS'")
    List<UserQuizAttempt> findActiveAttemptsByUserAndQuiz(UUID userId, Quiz quiz);

    @Modifying
    @Query("DELETE FROM UserQuizAttempt a WHERE a.quiz.id = :quizId")
    void deleteByQuizId(UUID quizId);

    @Modifying
    @Query("DELETE FROM UserQuizAttempt a WHERE a.quiz.courseLesson.lessonId = :lessonId")
    void deleteByLessonId(UUID lessonId);

    @Modifying
    @Query("DELETE FROM UserQuizAttempt a WHERE a.quiz.courseLesson.module.moduleId = :moduleId")
    void deleteByModuleId(UUID moduleId);
}
