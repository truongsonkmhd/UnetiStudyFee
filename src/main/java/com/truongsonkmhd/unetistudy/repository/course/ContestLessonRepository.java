package com.truongsonkmhd.unetistudy.repository.course;

import com.truongsonkmhd.unetistudy.common.StatusContest;
import com.truongsonkmhd.unetistudy.dto.contest_lesson.ContestLessonResponseDTO;
import com.truongsonkmhd.unetistudy.dto.contest_lesson.ContestLessonSummaryDTO;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.ContestLesson;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ContestLessonRepository extends JpaRepository<ContestLesson, UUID> {

    @Query("""
            select new com.truongsonkmhd.unetistudy.dto.contest_lesson.ContestLessonResponseDTO(
                ct.contestLessonId,
                ct.title,
                ct.description,
                ct.defaultDurationMinutes,
                ct.totalPoints,
                ct.defaultMaxAttempts,
                ct.passingScore,
                ct.showLeaderboardDefault,
                ct.instructions,
                ct.status
            )
            from ContestLesson ct
                        where
                            (:q is null or :q = '' or lower(ct.title) like lower(concat('%', :q, '%')))
                        and
                            (:statusContest is null or ct.status = :statusContest)
                        order by ct.createdAt desc
                        """)
    Page<ContestLessonResponseDTO> searchContestAdvance(
            @Param("q") String q,
            @Param("statusContest") StatusContest statusContest,
            Pageable pageable);

    @Query("""
            select new com.truongsonkmhd.unetistudy.dto.contest_lesson.ContestLessonSummaryDTO(
                ct.contestLessonId,
                ct.title,
                ct.description,
                ct.totalPoints,
                ct.defaultDurationMinutes,
                ct.defaultMaxAttempts,
                ct.passingScore,
                ct.status,
                ct.isActive,
                ct.createdAt,
                ct.updatedAt,
                (select count(ce) from ct.codingExercises ce),
                (select count(qz) from ct.quizzes qz),
                (select count(clc) from ClassContest clc where clc.contestLesson = ct and clc.isActive = true)
            )
            from ContestLesson ct
            where
                (:q is null or :q = '' or lower(ct.title) like lower(concat('%', :q, '%')))
            and
                (ct.status = :status)
            order by ct.createdAt desc
            """)
    Page<ContestLessonSummaryDTO> findSummaryByStatus(
            @Param("q") String q,
            @Param("status") StatusContest status,
            Pageable pageable);

}
