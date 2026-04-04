package com.truongsonkmhd.unetistudy.model.quiz.template;

import com.truongsonkmhd.unetistudy.model.quiz.Question;
import com.truongsonkmhd.unetistudy.model.quiz.base.BaseEntityQuestion;
import com.truongsonkmhd.unetistudy.model.quiz.base.BaseEntityQuiz;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_question_template", indexes = {
        @Index(name = "idx_question_template_quiz", columnList = "template_id")
})
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuestionTemplate extends BaseEntityQuestion {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    QuizTemplate quizTemplate;

    @OneToMany(mappedBy = "questionTemplate", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("answerOrder ASC")
    @Builder.Default
    Set<AnswerTemplate> answerTemplates = new LinkedHashSet<>();

    public Question toQuestion() {
        Question question = Question.builder()
                .content(this.getContent())
                .questionOrder(this.getQuestionOrder())
                .points(this.getPoints())
                .timeLimitSeconds(this.getTimeLimitSeconds())
                .build();

        if (this.getAnswerTemplates() != null) {
            this.getAnswerTemplates().forEach(answerTemplate -> question.addAnswer(answerTemplate.toAnswer()));
        }

        return question;
    }

    // Helper methods
    public void addAnswerTemplate(AnswerTemplate answerTemplate) {
        answerTemplates.add(answerTemplate);
        answerTemplate.setQuestionTemplate(this);
    }

    public void removeAnswerTemplate(AnswerTemplate answerTemplate) {
        answerTemplates.remove(answerTemplate);
        answerTemplate.setQuestionTemplate(null);
    }
}