package com.truongsonkmhd.unetistudy.dto.enrollment;

import lombok.Data;

@Data
public class EnrollmentApprovalRequest {
    private boolean approved; // true = approve, false = reject
    private String reason; // for rejection
}
