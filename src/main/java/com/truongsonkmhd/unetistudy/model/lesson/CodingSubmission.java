package com.truongsonkmhd.unetistudy.model.lesson;

import com.truongsonkmhd.unetistudy.common.SubmissionVerdict;
import com.truongsonkmhd.unetistudy.model.User;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.CodingExercise;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "tbl_coding_submission", indexes = {
        @Index(name = "idx_sub_user", columnList = "user_id"),
        @Index(name = "idx_sub_exercise", columnList = "exercise_id"),
        @Index(name = "idx_sub_submitted_at", columnList = "submitted_at"),
        @Index(name = "idx_sub_verdict", columnList = "verdict"),
        @Index(name = "idx_sub_language", columnList = "language")
})
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CodingSubmission {

    @Id
    @UuidGenerator
    @Column(name = "submission_id", nullable = false, updatable = false)
    UUID submissionId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exercise_id", nullable = false)
    CodingExercise exercise;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    // CODE ĐÃ NỘP
    @Column(name = "code", columnDefinition = "text")
    String code;

    // NGÔN NGỮ LẬP TRÌNH
    @Column(name = "language", length = 50)
    String language;

    /**
     * TRẠNG THÁI / KẾT QUẢ CHẤM BÀI
     * Ví dụ: PENDING, RUNNING, ACCEPTED, WRONG_ANSWER, TIME_LIMIT...
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "verdict", length = 30, nullable = false)
    SubmissionVerdict verdict;

    // SỐ TEST CASE PASS
    @Column(name = "passed_testcases", nullable = false)
    Integer passedTestcases;

    // TỔNG TEST CASE
    @Column(name = "total_testcases", nullable = false)
    Integer totalTestcases;

    // THỜI GIAN CHẠY (ms)
    @Column(name = "runtime_ms")
    Integer runtimeMs;

    // BỘ NHỚ (KB)
    @Column(name = "memory_kb")
    Integer memoryKb;

    // ĐIỂM
    @Column(name = "score", nullable = false)
    Integer score;

    // THỜI ĐIỂM NỘP
    @CreationTimestamp
    @Column(name = "submitted_at", nullable = false, updatable = false, columnDefinition = "timestamptz")
    Instant submittedAt;

    /**
     * Đảm bảo default không null ngay cả khi builder/setter không set
     */
    @PrePersist
    void prePersist() {
        if (verdict == null)
            verdict = SubmissionVerdict.PENDING;
        if (passedTestcases == null)
            passedTestcases = 0;
        if (totalTestcases == null)
            totalTestcases = 0;
        if (score == null)
            score = 0;
    }
}
