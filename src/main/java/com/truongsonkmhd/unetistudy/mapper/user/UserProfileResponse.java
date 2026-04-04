package com.truongsonkmhd.unetistudy.mapper.user;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class UserProfileResponse {
    private UUID id;
    private String fullName;
    private String username;
    private String avatar;
    private String contactAddress;

    private String role;

    // student
    private String studentId;
    private String classId;

    // teacher
    private String teacherId;
    private String department;

}
