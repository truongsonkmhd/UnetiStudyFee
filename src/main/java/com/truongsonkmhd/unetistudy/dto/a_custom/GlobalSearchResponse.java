package com.truongsonkmhd.unetistudy.dto.a_custom;

import com.truongsonkmhd.unetistudy.dto.class_dto.ClassQuickSearchResponse;
import com.truongsonkmhd.unetistudy.dto.course_dto.CourseQuickSearchResponse;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class GlobalSearchResponse {
    private List<CourseQuickSearchResponse> courses;
    private List<ClassQuickSearchResponse> classes;
}
