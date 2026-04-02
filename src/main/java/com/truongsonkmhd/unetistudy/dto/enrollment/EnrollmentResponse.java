package com.truongsonkmhd.unetistudy.dto.enrollment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentResponse {
    private UUID enrollmentId;
    private UUID courseId;
    private String courseName;
    private UUID studentId;
    private String studentName;
    private String studentEmail;
    private String studentCode; // Student ID/Code
    private String status;
    private Instant requestedAt;
    private Instant approvedAt;
    private String requestMessage;
    private String rejectionReason;
    private String slug;
}
