package com.truongsonkmhd.unetistudy.dto.class_dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassCourseResponse {
    private UUID courseId;
    private String title;
    private String slug;
    private String imageUrl;
    private String level;
    private String category;
    private Integer capacity;
    private Integer enrolledCount;
}
