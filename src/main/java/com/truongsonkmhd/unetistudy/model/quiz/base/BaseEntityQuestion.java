package com.truongsonkmhd.unetistudy.model.quiz.base;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@MappedSuperclass
@FieldDefaults(level = AccessLevel.PRIVATE)
public abstract class BaseEntityQuestion  extends BaseEntity{

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    String content;

    @Column(name = "question_order", nullable = false)
    Integer questionOrder;

    @Column(name = "time_limit_seconds", nullable = false)
    @Builder.Default
    Integer timeLimitSeconds = 5;

    @Column(name = "points")
    @Builder.Default
    Double points = 1.0;

}
