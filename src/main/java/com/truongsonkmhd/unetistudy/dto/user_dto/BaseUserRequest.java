package com.truongsonkmhd.unetistudy.dto.user_dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.truongsonkmhd.unetistudy.common.Gender;
import com.truongsonkmhd.unetistudy.validator.GenderSubset;
import com.truongsonkmhd.unetistudy.validator.PhoneNumber;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;

import java.io.Serializable;
import java.util.Date;

import static com.truongsonkmhd.unetistudy.common.Gender.*;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PROTECTED)
public abstract class BaseUserRequest implements Serializable {

    @NotBlank(message = "fullName must be not blank")
    String fullName;

    @GenderSubset(anyOf = { MALE, FEMALE, OTHER })
    Gender gender;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    @JsonFormat(pattern = "yyyy-MM-dd")
    Date birthday;

    @NotNull(message = "username must be not null")
    String username;

    @NotNull(message = "password must be not null")
    String password;

    @Email(message = "email invalid format")
    String email;

    @PhoneNumber(message = "phone invalid format")
    String phone;

    String contactAddress;

    @NotBlank(message = "currentResidence must not be blank")
    String currentResidence;
}
