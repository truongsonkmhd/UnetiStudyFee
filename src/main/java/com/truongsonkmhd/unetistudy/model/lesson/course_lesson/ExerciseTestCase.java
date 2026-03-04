package com.truongsonkmhd.unetistudy.model.lesson.course_lesson;

import com.truongsonkmhd.unetistudy.model.lesson.base.BaseExerciseTestCase;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "tbl_exercise_test_case",
        indexes = {
                @Index(name = "idx_test_exercise", columnList = "coding_exercise_id")
        })
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ExerciseTestCase extends BaseExerciseTestCase {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coding_exercise_id", nullable = false)
    CodingExercise codingExercise;
}
