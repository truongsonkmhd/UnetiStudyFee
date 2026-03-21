package com.truongsonkmhd.unetistudy.dto.user_dto;

import com.truongsonkmhd.unetistudy.common.Gender;
import com.truongsonkmhd.unetistudy.common.UserStatus;
import com.truongsonkmhd.unetistudy.dto.role_dto.RoleResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.Date;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse implements Serializable {
     UUID id;
     String fullName;
     Gender gender;
     Date birthday;
     String username;
     String email;
     String phone;
     String contactAddress;
     String currentResidence;
     UserStatus status;
     String studentID;
     String classID;
     String teacherID;
     String department;
     String academicRank;
     String specialization;
     Set<RoleResponse> roles;
}
