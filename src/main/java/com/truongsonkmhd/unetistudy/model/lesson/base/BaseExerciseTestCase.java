package com.truongsonkmhd.unetistudy.model.lesson.base;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@MappedSuperclass
@FieldDefaults(level = AccessLevel.PRIVATE)
public abstract class BaseExerciseTestCase {

    @Id
    @UuidGenerator
    @Column(name = "test_case_id", nullable = false, updatable = false)
    UUID testCaseId;

    @Column(name = "input", columnDefinition = "text", nullable = false)
    String input;

    @Column(name = "expected_output", columnDefinition = "text", nullable = false)
    String expectedOutput;

    @Column(name = "is_sample", nullable = false)
    @Builder.Default
    Boolean isSample = false;

    @Column(name = "explanation", columnDefinition = "text")
    String explanation;

    @Column(name = "order_index")
    Integer orderIndex;

    @Column(name = "points")
    Integer points;
}
