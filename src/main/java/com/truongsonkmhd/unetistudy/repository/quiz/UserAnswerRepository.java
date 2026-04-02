package com.truongsonkmhd.unetistudy.repository.quiz;

import com.truongsonkmhd.unetistudy.model.quiz.UserAnswer;
import com.truongsonkmhd.unetistudy.model.quiz.UserQuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserAnswerRepository extends JpaRepository<UserAnswer, UUID> {
        List<UserAnswer> findByAttempt(UserQuizAttempt attempt);

        @Modifying
        @Query(value = "DELETE FROM tbl_user_selected_answers WHERE answer_id = :answerId", nativeQuery = true)
        void deleteSelectedAnswerReferences(@Param("answerId") UUID answerId);

        @Modifying
        @Query(value = "DELETE FROM tbl_user_selected_answers WHERE answer_id IN " +
                        "(SELECT id FROM tbl_answer WHERE question_id = :questionId)", nativeQuery = true)
        void deleteSelectedAnswerReferencesByQuestionId(@Param("questionId") UUID questionId);

        @Modifying
        @Query(value = "DELETE FROM tbl_user_selected_answers WHERE answer_id IN " +
                        "(SELECT a.id FROM tbl_answer a JOIN tbl_question q ON a.question_id = q.id WHERE q.quiz_id = :quizId)", nativeQuery = true)
        void deleteSelectedAnswerReferencesByQuizId(@Param("quizId") UUID quizId);

        @Modifying
        @Query(value = "DELETE FROM tbl_user_selected_answers WHERE answer_id IN " +
                        "(SELECT a.id FROM tbl_answer a JOIN tbl_question q ON a.question_id = q.id " +
                        "JOIN tbl_course_lesson_to_quiz ltq ON q.quiz_id = ltq.quiz_id " +
                        "WHERE ltq.lesson_id = :lessonId)", nativeQuery = true)
        void deleteSelectedAnswerReferencesByLessonId(@Param("lessonId") UUID lessonId);

        @Modifying
        @Query(value = "DELETE FROM tbl_user_selected_answers WHERE answer_id IN " +
                        "(SELECT a.id FROM tbl_answer a JOIN tbl_question q ON a.question_id = q.id " +
                        "JOIN tbl_course_lesson_to_quiz ltq ON q.quiz_id = ltq.quiz_id " +
                        "JOIN tbl_course_lesson cl ON ltq.lesson_id = cl.lesson_id " +
                        "WHERE cl.module_id = :moduleId)", nativeQuery = true)
        void deleteSelectedAnswerReferencesByModuleId(@Param("moduleId") UUID moduleId);

        @Modifying
        @Query(value = "DELETE FROM tbl_user_answer WHERE question_id IN (SELECT id FROM tbl_question WHERE quiz_id = :quizId)", nativeQuery = true)
        void deleteByQuizId(@Param("quizId") UUID quizId);

        @Modifying
        @Query("DELETE FROM UserAnswer ua WHERE ua.question.id = :questionId")
        void deleteByQuestionId(@Param("questionId") UUID questionId);

        @Modifying
        @Query(value = "DELETE FROM tbl_user_answer WHERE user_answer_id IN ( " +
                        "SELECT ua.user_answer_id FROM tbl_user_answer ua " +
                        "JOIN tbl_question q ON ua.question_id = q.id " +
                        "JOIN tbl_course_lesson_to_quiz ltq ON q.quiz_id = ltq.quiz_id " +
                        "WHERE ltq.lesson_id = :lessonId)", nativeQuery = true)
        void deleteByLessonId(@Param("lessonId") UUID lessonId);

        @Modifying
        @Query(value = "DELETE FROM tbl_user_answer WHERE user_answer_id IN ( " +
                        "SELECT ua.user_answer_id FROM tbl_user_answer ua " +
                        "JOIN tbl_question q ON ua.question_id = q.id " +
                        "JOIN tbl_course_lesson_to_quiz ltq ON q.quiz_id = ltq.quiz_id " +
                        "JOIN tbl_course_lesson cl ON ltq.lesson_id = cl.lesson_id " +
                        "WHERE cl.module_id = :moduleId)", nativeQuery = true)
        void deleteByModuleId(@Param("moduleId") UUID moduleId);
}