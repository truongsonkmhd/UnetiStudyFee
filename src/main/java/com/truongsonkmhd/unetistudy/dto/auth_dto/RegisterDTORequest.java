package com.truongsonkmhd.unetistudy.dto.auth_dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.truongsonkmhd.unetistudy.common.Gender;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.Date;
import java.util.Set;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RegisterDTORequest {

    String fullName;
    String userName;
    String password;
    String email;
    String phone;
    String type;
    Gender gender;
    String studentId;
    String classId;
    String contactAddress;
    String currentResidence;

    @NotNull(message = "dateOfBirth must be not null")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    @JsonFormat(pattern = "yyyy-MM-dd")
    Date birthday;

    Set<String> roleCodes;
}