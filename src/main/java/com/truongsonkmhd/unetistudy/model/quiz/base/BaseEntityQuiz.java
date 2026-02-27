package com.truongsonkmhd.unetistudy.model.quiz.base;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@FieldDefaults(level = AccessLevel.PRIVATE)
public abstract class BaseEntityQuiz extends BaseEntity {

    @Column(name = "title", nullable = false)
    String title;

    @Column(name = "description", columnDefinition = "text")
    String description;

    @Column(name = "total_questions")
    @Builder.Default
    Integer totalQuestions = 0;

    @Column(name = "thumbnail_url")
    String thumbnailUrl;

    @Column(name = "pass_score")
    Double passScore;

    @Column(name = "is_published", nullable = false)
    @Builder.Default
    Boolean isPublished = true;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    Boolean isActive = false;

    @Column(name = "category", length = 100)
    String category;

    @Column(name = "max_attempts")
    Integer maxAttempts;
}