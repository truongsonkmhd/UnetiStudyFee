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
        @Index(name = "idx_exercise_contest", columnList = "contest_lesson_id"),
        @Index(name = "idx_exercise_slug", columnList = "slug")
})
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CodingExercise extends BaseCodingExercise {

    @Id
    @UuidGenerator
    @Column(name = "exercise_id", nullable = false, updatable = false)
    UUID exerciseId;

    @Column(name = "template_id")
    UUID templateId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contest_lesson_id", nullable = true)
    ContestLesson contestLesson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = true)
    CourseLesson courseLesson;

    @OneToMany(mappedBy = "codingExercise", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    List<ExerciseTestCase> exerciseTestCases = new ArrayList<>();

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
