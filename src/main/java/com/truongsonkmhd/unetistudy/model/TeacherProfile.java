package com.truongsonkmhd.unetistudy.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Getter
@Setter
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "tbl_teacher_profile")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TeacherProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(name = "teacher_id", unique = true, length = 50)
    String teacherId;

    @Column(name = "department")
    String department;

    @Column(name = "academic_rank")
    String academicRank;

    @Column(name = "specialization")
    String specialization;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    User user;
}
