package com.truongsonkmhd.unetistudy.dto.user_dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TeacherCreateRequest extends BaseUserRequest {

    @NotBlank(message = "teacherID must be not blank")
    String teacherID;

    @NotBlank(message = "department must be not blank")
    String department;

    String academicRank;
    String specialization;
}
