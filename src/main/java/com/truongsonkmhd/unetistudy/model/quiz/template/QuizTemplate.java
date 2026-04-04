package com.truongsonkmhd.unetistudy.model.quiz.template;

import com.truongsonkmhd.unetistudy.model.quiz.Quiz;
import com.truongsonkmhd.unetistudy.model.quiz.base.BaseEntityQuiz;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_quiz_template", indexes = {
        @Index(name = "idx_template_category", columnList = "category"),
        @Index(name = "idx_template_is_active", columnList = "is_active"),
        @Index(name = "idx_template_is_deleted", columnList = "is_deleted")
})
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizTemplate extends BaseEntityQuiz {

    @Column(name = "usage_count")
    @Builder.Default
    Integer usageCount = 0;

    @OneToMany(mappedBy = "quizTemplate", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    List<QuestionTemplate> questionTemplates = new ArrayList<>();

    public Quiz toQuiz() {

        Quiz quiz = Quiz.builder()
                .title(this.getTitle())
                .description(this.getDescription())
                .thumbnailUrl(this.getThumbnailUrl())
                .passScore(this.getPassScore())
                .category(this.getCategory())
                .maxAttempts(this.getMaxAttempts())
                .isPublished(true)
                .isActive(true)
                .build();

        if (this.getQuestionTemplates() != null) {
            this.getQuestionTemplates().forEach(questionTemplate -> {
                quiz.addQuestion(questionTemplate.toQuestion());
            });

            quiz.setTotalQuestions(quiz.getQuestions().size());
        } else {
            quiz.setTotalQuestions(0);
        }

        return quiz;
    }

    public void addQuestionTemplate(QuestionTemplate questionTemplate) {
        questionTemplates.add(questionTemplate);
        questionTemplate.setQuizTemplate(this);
    }

    public void removeQuestionTemplate(QuestionTemplate questionTemplate) {
        questionTemplates.remove(questionTemplate);
        questionTemplate.setQuizTemplate(null);
    }

    public void incrementUsageCount() {
        this.usageCount = (this.usageCount == null ? 0 : this.usageCount) + 1;
    }

    public void softDelete() {
        this.setIsDeleted(true);
        this.setIsActive(false);
    }
}