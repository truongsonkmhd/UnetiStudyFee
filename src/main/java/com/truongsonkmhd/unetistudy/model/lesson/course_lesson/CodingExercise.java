package com.truongsonkmhd.unetistudy.model.lesson.course_lesson;

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
@Table(name = "tbl_coding_exercise", indexes = {
        @Index(name = "idx_exercise_slug", columnList = "slug")
})
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CodingExercise extends BaseCodingExercise {

    @ManyToMany(mappedBy = "codingExercises")
    @Builder.Default
    List<CourseLesson> courseLessons = new ArrayList<>();

    @ManyToMany(mappedBy = "codingExercises")
    @Builder.Default
    List<ContestLesson> contestLessons = new ArrayList<>();

    @Id
    @UuidGenerator
    @Column(name = "exercise_id", nullable = false, updatable = false)
    UUID exerciseId;

    @Column(name = "template_id")
    UUID templateId;

    @OneToMany(mappedBy = "codingExercise", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    List<ExerciseTestCase> exerciseTestCases = new ArrayList<>();

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    boolean isDeleted = false;

    // Helper methods (đúng bidirectional)
    public void addTestCase(ExerciseTestCase testCase) {
        if (testCase == null)
            return;
        exerciseTestCases.add(testCase);
        testCase.setCodingExercise(this);
    }

    public void removeTestCase(ExerciseTestCase testCase) {
        if (testCase == null)
            return;
        exerciseTestCases.remove(testCase);
        testCase.setCodingExercise(null);
    }
}
