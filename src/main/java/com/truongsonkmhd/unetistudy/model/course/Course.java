package com.truongsonkmhd.unetistudy.model.course;

import com.truongsonkmhd.unetistudy.common.CourseStatus;
import com.truongsonkmhd.unetistudy.model.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "tbl_course", indexes = {
        @Index(name = "idx_course_instructor", columnList = "instructor_id"),
        @Index(name = "idx_course_publish", columnList = "is_published,status"),
        @Index(name = "idx_course_category", columnList = "category,subCategory"),
        @Index(name = "idx_course_created", columnList = "created_at"),
        @Index(name = "idx_course_status", columnList = "status,submitted_at")
})
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "course_id")
    UUID courseId;

    @Column(name = "title", nullable = false, length = 255)
    String title;

    @Column(name = "slug", unique = true, length = 255)
    String slug;

    @Column(name = "description", columnDefinition = "text")
    String description;

    @Column(name = "short_description", length = 500)
    String shortDescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id")
    User instructor;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    List<CourseModule> modules = new ArrayList<>();

    @Column(name = "level", length = 20)
    String level;

    @Column(name = "category", length = 50)
    String category;

    @Column(name = "sub_category", length = 50)
    String subCategory;

    @Column(name = "duration")
    Integer duration;

    @Column(name = "capacity")
    Integer capacity;

    @Column(name = "enrolled_count", nullable = false)
    @Builder.Default
    Integer enrolledCount = 0;

    @Column(name = "rating", precision = 3, scale = 2, nullable = false)
    @Builder.Default
    BigDecimal rating = BigDecimal.ZERO;

    @Column(name = "rating_count", nullable = false)
    @Builder.Default
    Integer ratingCount = 0;

    @Column(name = "image_url", length = 255)
    String imageUrl;

    @Column(name = "video_url", length = 255)
    String videoUrl;

    @Column(name = "youtube_video_id", length = 20)
    String youtubeVideoId;

    @Column(name = "requirements", columnDefinition = "text")
    String requirements;

    @Column(name = "objectives", columnDefinition = "text")
    String objectives;

    @Column(name = "syllabus", columnDefinition = "text")
    String syllabus;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30, nullable = false)
    @Builder.Default
    CourseStatus status = CourseStatus.DRAFT;

    @Column(name = "is_published", nullable = false)
    @Builder.Default
    Boolean isPublished = false;

    @Column(name = "published_at")
    LocalDateTime publishedAt;

    // ===== Approval flow fields =====
    @Column(name = "submitted_at")
    Instant submittedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by")
    User submittedBy;

    @Column(name = "approved_at")
    Instant approvedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    User approvedBy;

    @Column(name = "rejected_reason", columnDefinition = "text")
    String rejectedReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    Instant createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    Instant updatedAt;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    boolean isDeleted = false;

    public void addCourse(CourseModule courseModule) {
        modules.add(courseModule);
        courseModule.setCourse(this);
    }

    // helper (tuỳ bạn)
    public boolean isOwner(UUID userId) {
        return instructor != null && instructor.getId() != null && instructor.getId().equals(userId);
    }
}
