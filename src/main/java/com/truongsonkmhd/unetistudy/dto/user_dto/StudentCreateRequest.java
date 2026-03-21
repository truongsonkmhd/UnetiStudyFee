package com.truongsonkmhd.unetistudy.dto.user_dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudentCreateRequest extends BaseUserRequest {

    @NotBlank(message = "studentCode must be not blank")
    @Pattern(regexp = "^\\d{11}$", message = "studentCode must be exactly 11 digits")
    String studentCode;

    @NotBlank(message = "classCode must be not blank")
    @Pattern(regexp = "^(DH|CD|LT|VB2|VLVH|TX)"
                    + "(TI|KT|QTKD|TC|CK|DD|OT|XD|TM)"
                    + "\\d{2}[A-Z]\\d"
                    + "(HN|ND|TH)$", message = "Invalid UNETI classCode format (e.g. DHTI16A3HN)")
    String classCode;
}
