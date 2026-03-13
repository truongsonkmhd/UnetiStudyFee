package com.truongsonkmhd.unetistudy.model.lesson.course_lesson;

import com.truongsonkmhd.unetistudy.common.LessonType;
import com.truongsonkmhd.unetistudy.model.User;
import com.truongsonkmhd.unetistudy.model.course.CourseModule;
import com.truongsonkmhd.unetistudy.model.quiz.Quiz;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "tbl_course_lesson", indexes = {
        @Index(name = "idx_lesson_module", columnList = "module_id"),
        @Index(name = "idx_lesson_slug", columnList = "slug"),
        @Index(name = "idx_lesson_published", columnList = "is_published")
})
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseLesson {

    @Id
    @UuidGenerator
    @Column(name = "lesson_id", nullable = false, updatable = false)
    UUID lessonId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    CourseModule module;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    User creator;

    @Column(name = "title", nullable = false)
    String title;

    @Column(name = "description", columnDefinition = "text")
    String description;

    @Column(name = "content", columnDefinition = "text")
    String content;

    @Column(name = "video_url")
    String videoUrl; // Có thể là YouTube URL hoặc PocketBase URL

    @Column(name = "youtube_video_id", length = 20)
    String youtubeVideoId; // Rút trích từ YouTube URL, dùng để tạo embed URL

    @Column(name = "order_index", nullable = false)
    @Builder.Default
    Integer orderIndex = 0;

    @ManyToMany(fetch = FetchType.LAZY, cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JoinTable(name = "tbl_course_lesson_to_coding_exercise", joinColumns = @JoinColumn(name = "lesson_id"), inverseJoinColumns = @JoinColumn(name = "exercise_id"))
    @Builder.Default
    List<CodingExercise> codingExercises = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY, cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JoinTable(name = "tbl_course_lesson_to_quiz", joinColumns = @JoinColumn(name = "lesson_id"), inverseJoinColumns = @JoinColumn(name = "quiz_id"))
    @Builder.Default
    List<Quiz> quizzes = new ArrayList<>();

    @Column(name = "is_preview", nullable = false)
    @Builder.Default
    Boolean isPreview = false;

    @Column(name = "is_published", nullable = false)
    @Builder.Default
    Boolean isPublished = false;

    @Column(name = "slug", unique = true, nullable = false)
    String slug;

    @Enumerated(EnumType.STRING)
    @Column(name = "lesson_type", nullable = false, length = 30)
    LessonType lessonType;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    Instant updatedAt;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    boolean isDeleted = false;

    // ======= HELPER METHODS =======

    public void addCodingExercise(CodingExercise exercise) {
        codingExercises.add(exercise);
    }

    public void removeCodingExercise(CodingExercise exercise) {
        codingExercises.remove(exercise);
    }

    public void addQuizQuestion(Quiz quiz) {
        quizzes.add(quiz);
    }

    public void removeQuizQuestion(Quiz quiz) {
        quizzes.remove(quiz);
    }

}