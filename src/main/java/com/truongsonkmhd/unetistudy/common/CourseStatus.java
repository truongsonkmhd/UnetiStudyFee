package com.truongsonkmhd.unetistudy.common;

public enum CourseStatus {
    DRAFT,              // tạo/sửa bình thường
    PENDING_APPROVAL,   // đã gửi yêu cầu duyệt
    APPROVED,           // admin duyệt
    REJECTED,           // admin từ chối
    PUBLISHED,          // khóa học đã công khai
    ARCHIVED            // khóa học đã ẩn/lưu trữ
}