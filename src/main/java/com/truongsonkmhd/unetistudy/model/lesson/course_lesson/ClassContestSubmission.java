package com.truongsonkmhd.unetistudy.model.lesson.course_lesson;

import com.truongsonkmhd.unetistudy.model.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "tbl_class_contest_submission", indexes = {
        @Index(name = "idx_contest_sub_user", columnList = "user_id"),
        @Index(name = "idx_contest_sub_contest", columnList = "class_contest_id")
})
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ClassContestSubmission {

    @Id
    @UuidGenerator
    @Column(name = "submission_id", nullable = false, updatable = false)
    UUID submissionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_contest_id", nullable = false)
    ClassContest classContest;

    @Column(name = "started_at", nullable = false)
    Instant startedAt;

    @Column(name = "submitted_at")
    Instant submittedAt;

    @Column(name = "total_score")
    Double totalScore;

    @Column(name = "is_passed")
    Boolean isPassed;

    @Column(name = "status", length = 30)
    String status; // IN_PROGRESS, SUBMITTED, EXPIRED

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    Instant updatedAt;
}
