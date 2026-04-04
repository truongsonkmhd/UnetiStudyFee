package com.truongsonkmhd.unetistudy.dto.course_dto;

import com.truongsonkmhd.unetistudy.dto.lesson_dto.CourseLessonRequest;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseModuleRequest  {
     UUID moduleId;
     UUID lessonId;
     String title;        // Tiêu đề module
     String description;  // Mô tả chi tiết
     Integer orderIndex;  // Thứ tự module trong khóa học
     Integer duration;    // Thời lượng (tổng phút/giờ)
     Boolean isPublished; // Trạng thái publish
     String slug;

     @Builder.Default
     List<CourseLessonRequest> lessons = new ArrayList<>();
}
