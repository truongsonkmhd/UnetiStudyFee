package com.truongsonkmhd.unetistudy.model.quiz;

import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.ContestLesson;
import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.CourseLesson;
import com.truongsonkmhd.unetistudy.model.quiz.base.BaseEntityQuiz;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_quiz")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Quiz extends BaseEntityQuiz {

    @ManyToMany(mappedBy = "quizzes")
    @Builder.Default
    List<CourseLesson> courseLessons = new ArrayList<>();

    @ManyToMany(mappedBy = "quizzes")
    @Builder.Default
    List<ContestLesson> contestLessons = new ArrayList<>();

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    List<Question> questions = new ArrayList<>();

    @Column(name = "template_id")
    UUID templateId;

    public void addQuestion(Question question) {
        questions.add(question);
        question.setQuiz(this);
    }

    public void removeQuestion(Question question) {
        questions.remove(question);
        question.setQuiz(null);
    }
}