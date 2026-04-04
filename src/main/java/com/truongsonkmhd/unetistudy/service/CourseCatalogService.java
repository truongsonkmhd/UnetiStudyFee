package com.truongsonkmhd.unetistudy.service;

import com.truongsonkmhd.unetistudy.dto.course_dto.CourseCardResponse;
import com.truongsonkmhd.unetistudy.dto.a_common.CursorResponse;
import com.truongsonkmhd.unetistudy.dto.a_common.PageResponse;

public interface CourseCatalogService {
    PageResponse<CourseCardResponse> getPublishedCourses(int page, int size, String q, String category);

}
