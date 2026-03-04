package com.truongsonkmhd.unetistudy.model.quiz;

import com.truongsonkmhd.unetistudy.model.quiz.base.BaseEntityAnswer;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_answer", indexes = {
                @Index(name = "idx_answer_question", columnList = "question_id")
})
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Answer extends BaseEntityAnswer {

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "question_id", nullable = false)
        Question question;
}