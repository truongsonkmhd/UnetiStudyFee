package com.truongsonkmhd.unetistudy.model;

import com.truongsonkmhd.unetistudy.common.Gender;
import com.truongsonkmhd.unetistudy.common.UserStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.io.Serializable;
import java.util.*;

@Getter
@Setter
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "tbl_user")
@FieldDefaults(level = AccessLevel.PRIVATE)

public class User implements Serializable {

        @Id
        @GeneratedValue(strategy = GenerationType.UUID)
        @Column(name = "id")
        UUID id;

        @Column(name = "full_name", length = 255)
        String fullName;

        @Enumerated(EnumType.STRING)
        @JdbcTypeCode(SqlTypes.NAMED_ENUM)
        @Column(name = "gender", length = 255)
        Gender gender;

        @Column(name = "date_of_birth", length = 255)
        Date birthday;

        @Column(name = "email", length = 255)
        String email;

        @Column(name = "phone", length = 15)
        String phone;

        @Column(name = "username", unique = true, nullable = false, length = 255)
        String username;

        @Column(name = "password", length = 255)
        String password;

        @Column(name = "avatar")
        String avatar;

        @Column(name = "student_id", length = 20, unique = true)
        String studentId;

        @Column(name = "contactAddress")
        String contactAddress;

        @Column(name = "currentResidence")
        String currentResidence;

        @Column(name = "class_id", length = 20)
        String classId;

        @Column(name = "is_deleted")
        Boolean isDeleted;

        @Enumerated(EnumType.STRING)
        @JdbcTypeCode(SqlTypes.NAMED_ENUM)
        @Column(name = "status", nullable = false)
        UserStatus status;

        @ManyToMany
        @JoinTable(name = "tbl_user_role", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
        Set<Role> roles;

        @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
        Token token;

        @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
        TeacherProfile teacherProfile;

}
