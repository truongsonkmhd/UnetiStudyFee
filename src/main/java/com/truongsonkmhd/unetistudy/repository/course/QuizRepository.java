package com.truongsonkmhd.unetistudy.repository.course;

import com.truongsonkmhd.unetistudy.model.quiz.Quiz;
import io.lettuce.core.dynamic.annotation.Param;
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
            where q.courseLesson.lessonId in :lessonIds
            """)
    List<Quiz> findQuizzesByLessonIds(List<UUID> lessonIds);

    @Query("""
                select avg(qa.passScore)
                from Quiz qa
                where qa.courseLesson.lessonId= :lessonId
            """)
    Double avgScore(
            @Param("userId") UUID userId,
            @Param("lessonId") UUID lessonId);
}
