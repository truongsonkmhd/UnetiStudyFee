package com.truongsonkmhd.unetistudy.model.lesson.course_lesson;


import com.truongsonkmhd.unetistudy.common.ClassContestStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

/**
 * ClassContest: Đại diện cho việc SỬ DỤNG một Contest trong một Lớp cụ thể
 * - Chứa THỜI GIAN, TRẠNG THÁI CỤ THỂ cho lớp đó
 * - Có thể ghi đè (override) các cấu hình từ ContestLesson
 * - Giống như "lịch thi cụ thể" cho một lớp
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "tbl_class_contest",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_class_contest", columnNames = {"class_id", "contest_lesson_id"})
        },
        indexes = {
                @Index(name = "idx_class_contest_class", columnList = "class_id"),
                @Index(name = "idx_class_contest_lesson", columnList = "contest_lesson_id"),
                @Index(name = "idx_class_contest_time", columnList = "scheduled_start_time, scheduled_end_time"),
                @Index(name = "idx_class_contest_status", columnList = "status")
        })
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ClassContest {

    @Id
    @UuidGenerator
    @Column(name = "class_contest_id", nullable = false, updatable = false)
    UUID classContestId;

    // Lớp học sử dụng contest này
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "class_id", nullable = false)
    Clazz clazz;

    // Contest template được sử dụng
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "contest_lesson_id", nullable = false)
    ContestLesson contestLesson;

    // ======= THỜI GIAN CỤ THỂ CHO LỚP NÀY =======
    @Column(name = "scheduled_start_time", nullable = false)
    Instant scheduledStartTime;

    @Column(name = "scheduled_end_time", nullable = false)
    Instant scheduledEndTime;

    // ======= TRẠNG THÁI CỤ THỂ CHO LỚP NÀY =======
    // SCHEDULED: Đã lên lịch, chưa bắt đầu
    // ONGOING: Đang diễn ra
    // COMPLETED: Đã kết thúc
    // CANCELLED: Đã hủy
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    ClassContestStatus status = ClassContestStatus.SCHEDULED;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    Boolean isActive = true;

    // ======= CẤU HÌNH GHI ĐÈ (Override) =======

    // Trọng số điểm cho lớp này (ví dụ: 1.0 = 100%, 1.5 = 150%)
    @Column(name = "weight", nullable = false)
    @Builder.Default
    Double weight = 1.0;

    // Số lần thử tối đa cho lớp này (null = dùng mặc định từ ContestLesson)
    @Column(name = "max_attempts_override")
    Integer maxAttemptsOverride;

    // Có hiển thị bảng xếp hạng cho lớp này không
    @Column(name = "show_leaderboard_override")
    Boolean showLeaderboardOverride;

    // Hướng dẫn riêng cho lớp (bổ sung hoặc thay thế)
    @Column(name = "instructions_override", columnDefinition = "text")
    String instructionsOverride;

    // Điểm đạt riêng cho lớp này
    @Column(name = "passing_score_override")
    Integer passingScoreOverride;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    Instant updatedAt;

    // ======= GETTER HIỆU QUẢ (Effective Values) =======
    // Các method này trả về giá trị thực tế được sử dụng (override hoặc mặc định)

    public Integer getEffectiveMaxAttempts() {
        return maxAttemptsOverride != null
                ? maxAttemptsOverride
                : contestLesson.getDefaultMaxAttempts();
    }

    public Boolean getEffectiveShowLeaderboard() {
        return showLeaderboardOverride != null
                ? showLeaderboardOverride
                : contestLesson.getShowLeaderboardDefault();
    }

    public String getEffectiveInstructions() {
        if (instructionsOverride != null && !instructionsOverride.isBlank()) {
            return instructionsOverride;
        }
        return contestLesson.getInstructions();
    }

    public Integer getEffectivePassingScore() {
        return passingScoreOverride != null
                ? passingScoreOverride
                : contestLesson.getPassingScore();
    }

    public Integer getEffectiveTotalPoints() {
        // Áp dụng weight vào tổng điểm
        return (int) Math.round(contestLesson.getTotalPoints() * weight);
    }

    // ======= BUSINESS LOGIC =======

    public boolean isScheduled() {
        return status == ClassContestStatus.SCHEDULED && isActive;
    }

    public boolean isOngoing(Instant now) {
        return isActive &&
                status == ClassContestStatus.ONGOING &&
                now.isAfter(scheduledStartTime) &&
                now.isBefore(scheduledEndTime);
    }

    public boolean isUpcoming(Instant now) {
        return isActive &&
                status == ClassContestStatus.SCHEDULED &&
                now.isBefore(scheduledStartTime);
    }

    public boolean isCompleted() {
        return status == ClassContestStatus.COMPLETED;
    }

    public boolean isCancelled() {
        return status == ClassContestStatus.CANCELLED;
    }

    public boolean isEnded(Instant now) {
        return !isActive ||
                status == ClassContestStatus.COMPLETED ||
                status == ClassContestStatus.CANCELLED ||
                now.isAfter(scheduledEndTime);
    }

    public long getDurationInMinutes() {
        return java.time.Duration.between(scheduledStartTime, scheduledEndTime).toMinutes();
    }

    // Tự động cập nhật trạng thái dựa trên thời gian
    public void updateStatusBasedOnTime(Instant now) {
        if (!isActive || status == ClassContestStatus.CANCELLED) {
            return;
        }

        if (now.isBefore(scheduledStartTime)) {
            this.status = ClassContestStatus.SCHEDULED;
        } else if (now.isAfter(scheduledEndTime)) {
            this.status = ClassContestStatus.COMPLETED;
        } else {
            this.status = ClassContestStatus.ONGOING;
        }
    }

    // Kiểm tra xem có thể hủy không
    public boolean canBeCancelled() {
        return isActive &&
                (status == ClassContestStatus.SCHEDULED || status == ClassContestStatus.ONGOING);
    }

    // Hủy contest cho lớp
    public void cancel() {
        if (!canBeCancelled()) {
            throw new IllegalStateException(
                    "Cannot cancel contest with status: " + status
            );
        }
        this.status = ClassContestStatus.CANCELLED;
        this.isActive = false;
    }

    // Kiểm tra xem có thể chỉnh sửa thời gian không
    public boolean canReschedule() {
        return isActive && status == ClassContestStatus.SCHEDULED;
    }

    // Đổi lịch thi
    public void reschedule(Instant newStartTime, Instant newEndTime) {
        if (!canReschedule()) {
            throw new IllegalStateException(
                    "Cannot reschedule contest with status: " + status
            );
        }
        if (newStartTime.isAfter(newEndTime)) {
            throw new IllegalArgumentException(
                    "Start time must be before end time"
            );
        }
        this.scheduledStartTime = newStartTime;
        this.scheduledEndTime = newEndTime;
    }
}

