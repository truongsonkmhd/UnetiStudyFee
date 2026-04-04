package com.truongsonkmhd.unetistudy.model.quiz;

import com.truongsonkmhd.unetistudy.common.AttemptStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_user_quiz_attempt", indexes = {
        @Index(name = "idx_attempt_user", columnList = "user_id"),
        @Index(name = "idx_attempt_quiz", columnList = "quiz_id"),
        @Index(name = "idx_attempt_user_quiz", columnList = "user_id, quiz_id")
})
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserQuizAttempt {

    @Id
    @UuidGenerator
    @Column(name = "attempt_id", nullable = false, updatable = false)
    UUID attemptId;

    @Column(name = "user_id", nullable = false)
    UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    Quiz quiz;

    @Column(name = "score")
    Double score;

    @Column(name = "total_points")
    Double totalPoints;

    @Column(name = "percentage")
    Double percentage;

    @Column(name = "is_passed")
    Boolean isPassed;

    @Column(name = "started_at", nullable = false)
    Instant startedAt;

    @Column(name = "completed_at")
    Instant completedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    AttemptStatus status = AttemptStatus.IN_PROGRESS;

    @OneToMany(mappedBy = "attempt", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<UserAnswer> userAnswers = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    Instant updatedAt;

    // Helper methods
    public void addUserAnswer(UserAnswer userAnswer) {
        userAnswers.add(userAnswer);
        userAnswer.setAttempt(this);
    }
}