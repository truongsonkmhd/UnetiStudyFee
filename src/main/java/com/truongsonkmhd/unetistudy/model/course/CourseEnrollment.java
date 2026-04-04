package com.truongsonkmhd.unetistudy.model.course;

import com.truongsonkmhd.unetistudy.common.EnrollmentStatus;
import com.truongsonkmhd.unetistudy.model.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "tbl_course_enrollment", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "course_id", "student_id" })
}, indexes = {
        @Index(name = "idx_enrollment_course", columnList = "course_id"),
        @Index(name = "idx_enrollment_student", columnList = "student_id"),
        @Index(name = "idx_enrollment_status", columnList = "status")
})
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseEnrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "enrollment_id")
    UUID enrollmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    User student;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    EnrollmentStatus status;

    @Column(name = "request_message", columnDefinition = "text")
    String requestMessage; // Optional message from student

    @Column(name = "rejection_reason", columnDefinition = "text")
    String rejectionReason; // Optional reason from teacher

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    Instant updatedAt;

    @Column(name = "approved_at")
    Instant approvedAt;
}
