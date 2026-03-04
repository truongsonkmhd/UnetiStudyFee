package com.truongsonkmhd.unetistudy.model.lesson.course_lesson;

import com.truongsonkmhd.unetistudy.model.User;
import com.truongsonkmhd.unetistudy.model.course.Course;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "tbl_class", indexes = {
        @Index(name = "idx_class_code", columnList = "class_code"),
        @Index(name = "idx_class_instructor", columnList = "instructor_id")
})
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Clazz {

    @Id
    @UuidGenerator
    @Column(name = "class_id", nullable = false, updatable = false)
    UUID classId;

    @Column(name = "class_code", unique = true, nullable = false, length = 50)
    String classCode;

    @Column(name = "class_name", nullable = false)
    String className;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "instructor_id", nullable = false)
    User instructor;

    // Các contest được gán vào lớp này
    @OneToMany(mappedBy = "clazz", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    List<ClassContest> classContests = new ArrayList<>();

    @Column(name = "start_date", nullable = false)
    Instant startDate;

    @Column(name = "end_date")
    Instant endDate;

    @Column(name = "max_students")
    Integer maxStudents;

    @Column(name = "invite_code", unique = true, length = 10)
    String inviteCode;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "tbl_class_student", joinColumns = @JoinColumn(name = "class_id"), inverseJoinColumns = @JoinColumn(name = "student_id"))
    @Builder.Default
    Set<User> students = new HashSet<>();

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    Instant updatedAt;

    // Helper methods
    public void addClassContest(ClassContest classContest) {
        classContests.add(classContest);
        classContest.setClazz(this);
    }

    public void removeClassContest(ClassContest classContest) {
        classContests.remove(classContest);
        classContest.setClazz(null);
    }

    public void addStudent(User student) {
        students.add(student);
    }

    public void removeStudent(User student) {
        students.remove(student);
    }

    public List<ClassContest> getActiveContests() {
        return classContests.stream()
                .filter(ClassContest::getIsActive)
                .toList();
    }

    public List<ClassContest> getOngoingContests(Instant now) {
        return classContests.stream()
                .filter(cc -> cc.isOngoing(now))
                .toList();
    }

    public List<ClassContest> getUpcomingContests(Instant now) {
        return classContests.stream()
                .filter(cc -> cc.isUpcoming(now))
                .toList();
    }
}