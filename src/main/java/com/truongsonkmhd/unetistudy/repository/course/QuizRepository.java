package com.truongsonkmhd.unetistudy.repository.course;

import com.truongsonkmhd.unetistudy.model.quiz.Quiz;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, UUID> {

        @Query("""
                        select q
                        from Quiz q
                        join q.courseLessons cl
                        where cl.lessonId in :lessonIds
                        """)
        List<Quiz> findQuizzesByLessonIds(@Param("lessonIds") List<UUID> lessonIds);

        @Query("""
                            select avg(qa.passScore)
                            from Quiz qa
                            join qa.courseLessons cl
                            where cl.lessonId = :lessonId
                        """)
        Double avgScore(
                        @Param("lessonId") UUID lessonId);
}
