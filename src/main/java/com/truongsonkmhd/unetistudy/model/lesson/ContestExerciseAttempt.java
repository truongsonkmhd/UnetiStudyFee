package com.truongsonkmhd.unetistudy.model.lesson;

import com.truongsonkmhd.unetistudy.model.User;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.CourseLesson;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "tbl_contest_exercise_attempt")
public class ContestExerciseAttempt {
    @Id
    @UuidGenerator
    @Column(name = "attempt_id", nullable = false, updatable = false)
    UUID attemptID;

    @Column(name = "exercise_id", nullable = false)
    UUID exerciseID;

    @ManyToOne
    @JoinColumn(name = "lesson_id", nullable = false)
    CourseLesson lesson;

    @ManyToOne
    @JoinColumn(name = "id", nullable = false)
    User user;

    @Column(name = "submitted_at", nullable = false)
    LocalDateTime submittedAt = LocalDateTime.now();

    @Column(name = "score")
    Double score;

    @Column(name = "exercise_type")
    String exerciseType;

    @Column(name = "attempt_number")
    Integer attemptNumber;

}
