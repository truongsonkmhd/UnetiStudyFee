package com.truongsonkmhd.unetistudy.model.quiz.template;


import com.truongsonkmhd.unetistudy.model.quiz.Answer;
import com.truongsonkmhd.unetistudy.model.quiz.Question;
import com.truongsonkmhd.unetistudy.model.quiz.base.BaseEntityAnswer;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_answer_template",
        indexes = {
                @Index(name = "idx_answer_template_question", columnList = "question_template_id")
        })
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AnswerTemplate extends BaseEntityAnswer {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_template_id", nullable = false)
    QuestionTemplate questionTemplate;

    public Answer toAnswer() {

        return Answer.builder()
                .content(this.getContent())
                .isCorrect(this.getIsCorrect())
                .answerOrder(this.getAnswerOrder())
                .build();


    }


}