package com.truongsonkmhd.unetistudy.model.lesson.base;

import com.truongsonkmhd.unetistudy.common.Difficulty;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

/**
 * Abstract base class containing common fields for coding exercises
 * Uses @MappedSuperclass to share fields without creating a separate table
 */
@MappedSuperclass
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PROTECTED)
public abstract class BaseCodingExercise {

    @Column(name = "title", nullable = false)
    String title;

    @Column(name = "description", columnDefinition = "text")
    String description;

    @Column(name = "programming_language", length = 50)
    String programmingLanguage;

    @Column(name = "initial_code", columnDefinition = "text")
    String initialCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty", nullable = false, length = 30)
    Difficulty difficulty;

    @Column(name = "solution_code", columnDefinition = "text")
    String solutionCode;

    @Column(name = "time_limit_ms", nullable = false)
    @Builder.Default
    Integer timeLimitMs = 1000;

    @Column(name = "memory_limit_mb", nullable = false)
    @Builder.Default
    Integer memoryLimitMb = 256;

    @Column(name = "slug", unique = true, length = 255)
    String slug;

    @Column(name = "input_format", columnDefinition = "text")
    String inputFormat;

    @Column(name = "output_format", columnDefinition = "text")
    String outputFormat;

    @Column(name = "constraint_name", length = 50)
    String constraintName;

    @Column(name = "points")
    @Builder.Default
    Integer points = 0;

    @Column(name = "is_published", nullable = false)
    @Builder.Default
    Boolean isPublished = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    Instant updatedAt;

    /**
     * Copy all common fields from this exercise to target
     */
    public void copyFieldsTo(BaseCodingExercise target) {
        target.setTitle(this.title);
        target.setDescription(this.description);
        target.setProgrammingLanguage(this.programmingLanguage);
        target.setInitialCode(this.initialCode);
        target.setDifficulty(this.difficulty);
        target.setSolutionCode(this.solutionCode);
        target.setTimeLimitMs(this.timeLimitMs);
        target.setMemoryLimitMb(this.memoryLimitMb);
        target.setInputFormat(this.inputFormat);
        target.setOutputFormat(this.outputFormat);
        target.setConstraintName(this.constraintName);
        target.setPoints(this.points);
        target.setIsPublished(this.isPublished);
    }
}