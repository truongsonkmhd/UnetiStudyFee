package com.truongsonkmhd.unetistudy.model.quiz;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_user_answer",
        indexes = {
                @Index(name = "idx_user_answer_attempt", columnList = "attempt_id"),
                @Index(name = "idx_user_answer_question", columnList = "question_id")
        })
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserAnswer {

    @Id
    @UuidGenerator
    @Column(name = "user_answer_id", nullable = false, updatable = false)
    UUID userAnswerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    UserQuizAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    Question question;

    @ManyToMany
    @JoinTable(
            name = "tbl_user_selected_answers",
            joinColumns = @JoinColumn(name = "user_answer_id"),
            inverseJoinColumns = @JoinColumn(name = "answer_id"),
            indexes = {
                    @Index(name = "idx_selected_user_answer", columnList = "user_answer_id"),
                    @Index(name = "idx_selected_answer", columnList = "answer_id")
            }
    )
    @Builder.Default
    Set<Answer> selectedAnswers = new HashSet<>();

    @Column(name = "is_correct")
    Boolean isCorrect;

    @Column(name = "points_earned")
    Double pointsEarned;

    @Column(name = "time_spent_seconds")
    Integer timeSpentSeconds;

    @Column(name = "is_timeout", nullable = false)
    @Builder.Default
    Boolean isTimeout = false;

    @CreationTimestamp
    @Column(name = "answered_at", nullable = false, updatable = false)
    Instant answeredAt;

    // Helper methods
    public void addSelectedAnswer(Answer answer) {
        selectedAnswers.add(answer);
    }

    public void removeSelectedAnswer(Answer answer) {
        selectedAnswers.remove(answer);
    }
}