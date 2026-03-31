package com.truongsonkmhd.unetistudy.dto.class_dto;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class ClassCourseRequest {
    /** Danh sách courseId cần gán(hoặc gỡ) khỏi lớp */
    private List<UUID> courseIds;
}
