package com.truongsonkmhd.unetistudy.model.coding_template;


import com.fasterxml.jackson.annotation.JsonIgnore;
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
@Table(name = "tbl_exercise_test_case_template")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ExerciseTemplateTestCase extends BaseExerciseTestCase {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    @JsonIgnore
    CodingExerciseTemplate template;

}
