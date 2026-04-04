package com.truongsonkmhd.unetistudy.model.lesson.course_lesson;

import com.truongsonkmhd.unetistudy.common.StatusContest;
import com.truongsonkmhd.unetistudy.model.quiz.Quiz;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * ContestLesson: Định nghĩa Template/Mẫu của một Contest
 * - Chứa CÂU HỎI, BÀI TẬP, CẤU HÌNH CHUNG
 * - KHÔNG chứa thời gian cụ thể cho từng lớp
 * - Giống như "đề thi gốc" có thể dùng lại nhiều lần
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "tbl_contest_lesson", indexes = {
        @Index(name = "idx_contest_active", columnList = "is_active"),
        @Index(name = "idx_contest_status", columnList = "status")
})
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ContestLesson {

    @Id
    @UuidGenerator
    @Column(name = "contest_lesson_id", nullable = false, updatable = false)
    UUID contestLessonId;

    @Column(name = "title", nullable = false)
    String title;

    @Column(name = "description", columnDefinition = "text")
    String description;

    @OneToMany(mappedBy = "contestLesson", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    List<ClassContest> classContests = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY, cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JoinTable(name = "tbl_contest_to_coding_exercise",
            joinColumns = @JoinColumn(name = "contest_lesson_id"),
            inverseJoinColumns = @JoinColumn(name = "exercise_id"))
    @Builder.Default
    List<CodingExercise> codingExercises = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY, cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JoinTable(name = "tbl_contest_to_quiz",
            joinColumns = @JoinColumn(name = "contest_lesson_id"),
            inverseJoinColumns = @JoinColumn(name = "quiz_id"))
    @Builder.Default
    List<Quiz> quizzes = new ArrayList<>();

    @Column(name = "default_duration_minutes")
    Integer defaultDurationMinutes;

    @Column(name = "total_points", nullable = false, columnDefinition = "INT DEFAULT 0")
    @Builder.Default
    Integer totalPoints = 0;

    @Column(name = "default_max_attempts")
    Integer defaultMaxAttempts;

    @Column(name = "passing_score")
    Integer passingScore;

    @Column(name = "show_leaderboard_default", nullable = false)
    @Builder.Default
    Boolean showLeaderboardDefault = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    StatusContest status = StatusContest.DRAFT;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    Boolean isActive = true;

    @Column(name = "instructions", columnDefinition = "text")
    String instructions;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    Instant updatedAt;

    // ======= HELPER METHODS =======

    public void addCodingExercise(CodingExercise exercise) {
        codingExercises.add(exercise);
        recalculateTotalPoints();
    }

    public void removeCodingExercise(CodingExercise exercise) {
        codingExercises.remove(exercise);
        recalculateTotalPoints();
    }

    public void addQuizQuestion(Quiz quiz) {
        quizzes.add(quiz);
        recalculateTotalPoints();
    }

    public void removeQuizQuestion(Quiz quiz) {
        quizzes.remove(quiz);
        recalculateTotalPoints();
    }

    public void addClassContest(ClassContest classContest) {
        classContests.add(classContest);
        classContest.setContestLesson(this);
    }

    public void removeClassContest(ClassContest classContest) {
        classContests.remove(classContest);
        classContest.setContestLesson(null);
    }

    // Tự động tính tổng điểm
    private void recalculateTotalPoints() {
        int codingPoints = codingExercises.stream()
                .mapToInt(CodingExercise::getPoints)
                .sum();
        int quizPoints = 0;
        this.totalPoints = codingPoints + quizPoints;
    }

    // ======= BUSINESS LOGIC =======

    public boolean isReadyToUse() {
        return isActive &&
                status == StatusContest.READY &&
                (!codingExercises.isEmpty() || !quizzes.isEmpty());
    }

    public boolean canBeAssignedToClass() {
        return isActive &&
                (status == StatusContest.READY);
    }

    // Kiểm tra xem contest có đang được dùng trong lớp nào không
    public boolean isUsedInClasses() {
        return !classContests.isEmpty();
    }

    // Lấy số lớp đang dùng contest này
    public long getActiveClassCount() {
        return classContests.stream()
                .filter(ClassContest::getIsActive)
                .count();
    }

    public void updateStatus(StatusContest newStatus) {
        if (isUsedInClasses() && newStatus == StatusContest.ARCHIVED) {
            throw new IllegalStateException(
                    "Cannot archive contest that is currently used in " + getActiveClassCount() + " class(es). " +
                            "Please remove it from all classes first or mark class contests as inactive.");
        }
        this.status = newStatus;
    }
}