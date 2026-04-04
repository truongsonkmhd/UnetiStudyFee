package com.truongsonkmhd.unetistudy.dto.course_module;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseModuleFILLDTO {
    String title;
    String slug;

}
