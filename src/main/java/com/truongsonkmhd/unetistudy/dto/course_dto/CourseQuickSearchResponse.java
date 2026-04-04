package com.truongsonkmhd.unetistudy.dto.course_dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseQuickSearchResponse {
    private UUID courseId;
    private String title;
    private String slug;
    private String imageUrl;
    private String shortDescription;
}
