package com.truongsonkmhd.unetistudy.model.coding_template;

import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.CodingExercise;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.ExerciseTestCase;
import com.truongsonkmhd.unetistudy.model.lesson.base.BaseCodingExercise;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.UuidGenerator;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_coding_exercise_template", indexes = {
        @Index(name = "uk_template_slug", columnList = "slug", unique = true),
        @Index(name = "idx_template_published", columnList = "is_published"),
        @Index(name = "idx_template_difficulty", columnList = "difficulty")
})
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CodingExerciseTemplate extends BaseCodingExercise {

    @Id
    @UuidGenerator
    @Column(name = "template_id", nullable = false, updatable = false)
    UUID templateId;

    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    List<ExerciseTemplateTestCase> exerciseTestCases = new ArrayList<>();

    @Column(name = "category", length = 50)
    String category;

    @Column(name = "tags", columnDefinition = "text")
    String tags;
    @Column(name = "usage_count", nullable = false)
    @Builder.Default
    Integer usageCount = 0; // Theo doi so lan su dung

    // Helper methods
    public void addTestCase(ExerciseTemplateTestCase testCase) {
        exerciseTestCases.add(testCase);
        testCase.setTemplate(this);
    }

    public void removeTestCase(ExerciseTemplateTestCase testCase) {
        exerciseTestCases.remove(testCase);
        testCase.setTemplate(null);
    }

    public CodingExercise toContestExercise() {
        CodingExercise exercise = CodingExercise.builder()
                .title(this.getTitle())
                .description(this.getDescription())
                .programmingLanguage(this.getProgrammingLanguage())
                .initialCode(this.getInitialCode())
                .difficulty(this.getDifficulty())
                .solutionCode(this.getSolutionCode())
                .timeLimitMs(this.getTimeLimitMs())
                .memoryLimitMb(this.getMemoryLimitMb())
                .slug(this.getSlug())
                .inputFormat(this.getInputFormat())
                .outputFormat(this.getOutputFormat())
                .constraintName(this.getConstraintName())
                .points(this.getPoints())
                .isPublished(true)
                .build();

        if (this.exerciseTestCases != null) {
            for (ExerciseTemplateTestCase tc : this.exerciseTestCases) {
                exercise.addTestCase(ExerciseTestCase.builder()
                        .input(tc.getInput())
                        .expectedOutput(tc.getExpectedOutput())
                        .isSample(tc.getIsSample())
                        .explanation(tc.getExplanation())
                        .orderIndex(tc.getOrderIndex())
                        .build());
            }
        }
        return exercise;
    }

    public void incrementUsageCount() {
        this.usageCount++;
    }
}