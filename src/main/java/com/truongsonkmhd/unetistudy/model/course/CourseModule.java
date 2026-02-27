package com.truongsonkmhd.unetistudy.model.course;

import com.truongsonkmhd.unetistudy.model.lesson.course_lesson.CourseLesson;
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
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "tbl_course_module")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseModule {

    @Id
    @UuidGenerator
    @Column(name = "module_id", updatable = false, nullable = false)
    UUID moduleId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    Course course;

    @OneToMany(mappedBy = "module", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    List<CourseLesson> lessons = new ArrayList<>();

    @Column(name = "title", nullable = false, length = 255)
    String title;

    @Column(name = "description", columnDefinition = "text")
    String description;

    @Column(name = "order_index", nullable = false)
    Integer orderIndex;

    @Column(name = "duration")
    Integer duration;

    @Column(name = "is_published", nullable = false)
    Boolean isPublished = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    Instant createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    Instant updatedAt;

    @Column(name = "slug", nullable = true)
    String slug;

}
