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
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

import static com.truongsonkmhd.unetistudy.common.Gender.*;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserUpdateRequest implements Serializable {
    @NotBlank(message = "fullName must be not blank") // Khong cho phep gia tri blank
    String fullName;

    @GenderSubset(anyOf = {MALE, FEMALE, OTHER})// cách 2 validation
    Gender gender;

    @NotNull(message = "dateOfBirth must be not null")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    @JsonFormat(pattern = "yyyy-MM-dd")
    Date birthday;

    @NotNull(message = "username must be not null")
    String username;

    @Email(message = "email invalid format") // Chi chap nhan nhung gia tri dung dinh dang email
    String email;

    @PhoneNumber(message = "phone invalid format")
    String phone;

    // Địa chỉ liên hệ (không bắt buộc, nhưng nếu có thì không được rỗng)
    @NotBlank(message = "contactAddress must not be blank")
    String contactAddress;

    // Hộ khẩu thường trú (không bắt buộc, nhưng nếu có thì không được rỗng)
    @NotBlank(message = "currentResidence must not be blank")
    String currentResidence;

    // Mã sinh viên UNETI – đúng 11 chữ số
    @jakarta.validation.constraints.Pattern(
            regexp = "^\\d{11}$",
            message = "studentCode must be exactly 11 digits"
    )
    String studentCode;

    // Mã lớp UNETI – ví dụ: DHTI16A3HN
    @jakarta.validation.constraints.Pattern(
            regexp = "^(DH|CD|LT|VB2|VLVH|TX)"
                    + "(TI|KT|QTKD|TC|CK|DD|OT|XD|TM)"
                    + "\\d{2}[A-Z]\\d"
                    + "(HN|ND|TH)$",
            message = "Invalid UNETI classCode format (e.g. DHTI16A3HN)"
    )
    String classCode;

    // --- Teacher Profile Fields (Optional) ---
    String teacherID;
    String department;
    String academicRank;
    String specialization;

    String avatar;

    List<String> roles;
}
