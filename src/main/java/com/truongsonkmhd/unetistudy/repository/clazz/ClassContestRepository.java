package com.truongsonkmhd.unetistudy.repository.clazz;


import com.truongsonkmhd.unetistudy.common.ClassContestStatus;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.ClassContest;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.Clazz;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.ContestLesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface ClassContestRepository extends JpaRepository<ClassContest, UUID> {

    // Tìm tất cả contest của một lớp
    List<ClassContest> findByClazz(Clazz clazz);

    // Tìm contest đang active của lớp
    List<ClassContest> findByClazzAndIsActiveTrue(Clazz clazz);

    // Kiểm tra trùng lặp
    boolean existsByClazzAndContestLesson(Clazz clazz, ContestLesson contestLesson);

    // Tìm contest theo trạng thái
    List<ClassContest> findByClazzAndStatus(Clazz clazz, ClassContestStatus status);

    // Tìm contest trong khoảng thời gian
    @Query("SELECT cc FROM ClassContest cc WHERE cc.clazz = :clazz " +
            "AND cc.isActive = true " +
            "AND cc.scheduledStartTime <= :endTime " +
            "AND cc.scheduledEndTime >= :startTime")
    List<ClassContest> findOverlappingContests(
            @Param("clazz") Clazz clazz,
            @Param("startTime") Instant startTime,
            @Param("endTime") Instant endTime
    );

    // Tìm contest đang diễn ra
    @Query("SELECT cc FROM ClassContest cc WHERE cc.clazz = :clazz " +
            "AND cc.isActive = true " +
            "AND cc.status = 'ONGOING' " +
            "AND :now >= cc.scheduledStartTime " +
            "AND :now <= cc.scheduledEndTime")
    List<ClassContest> findOngoingContests(
            @Param("clazz") Clazz clazz,
            @Param("now") Instant now
    );

    // Tìm contest sắp tới
    @Query("SELECT cc FROM ClassContest cc WHERE cc.clazz = :clazz " +
            "AND cc.isActive = true " +
            "AND cc.status = 'SCHEDULED' " +
            "AND cc.scheduledStartTime > :now")
    List<ClassContest> findUpcomingContests(
            @Param("clazz") Clazz clazz,
            @Param("now") Instant now
    );

    // Tìm contest đã kết thúc
    @Query("SELECT cc FROM ClassContest cc WHERE cc.clazz = :clazz " +
            "AND (cc.status = 'COMPLETED' OR cc.scheduledEndTime < :now)")
    List<ClassContest> findCompletedContests(
            @Param("clazz") Clazz clazz,
            @Param("now") Instant now
    );

    // Tìm tất cả contest của một ContestLesson
    List<ClassContest> findByContestLesson(ContestLesson contestLesson);

    // Đếm số lớp đang sử dụng một contest
    @Query("SELECT COUNT(cc) FROM ClassContest cc WHERE cc.contestLesson = :contestLesson " +
            "AND cc.isActive = true")
    long countActiveByContestLesson(@Param("contestLesson") ContestLesson contestLesson);
}