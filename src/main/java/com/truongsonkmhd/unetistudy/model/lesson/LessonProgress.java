package com.truongsonkmhd.unetistudy.model.lesson;

import com.truongsonkmhd.unetistudy.common.ProgressStatus;
import com.truongsonkmhd.unetistudy.model.User;
import com.truongsonkmhd.unetistudy.model.course.Course;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.CourseLesson;
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
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_lesson_progress", uniqueConstraints = @UniqueConstraint(name = "uk_progress_user_course_lesson", columnNames = {
                "user_id", "course_id", "lesson_id" }), indexes = {
                                @Index(name = "idx_progress_user", columnList = "user_id"),
                                @Index(name = "idx_progress_course", columnList = "course_id"),
                                @Index(name = "idx_progress_lesson", columnList = "lesson_id"),
                                @Index(name = "idx_progress_status", columnList = "status")
                })
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LessonProgress {

        @Id
        @UuidGenerator
        @Column(name = "progress_id", nullable = false, updatable = false)
        UUID progressId;

        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "user_id", nullable = false)
        User user;

        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "course_id", nullable = false)
        Course course;

        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "lesson_id", nullable = false)
        CourseLesson lesson;

        @Enumerated(EnumType.STRING)
        @Column(name = "status", nullable = false, length = 20)
        ProgressStatus status = ProgressStatus.NOT_STARTED;

        @Column(name = "completion_percent", nullable = false)
        Integer completionPercent = 0;

        @Column(name = "time_spent_sec", nullable = false)
        Integer timeSpentSec = 0;

        @Column(name = "last_access_at", columnDefinition = "timestamptz")
        Instant lastAccessAt;

        @CreationTimestamp
        @Column(name = "created_at", nullable = false, updatable = false, columnDefinition = "timestamptz")
        Instant createdAt;

        @UpdateTimestamp
        @Column(name = "updated_at", columnDefinition = "timestamptz")
        Instant updatedAt;
}
