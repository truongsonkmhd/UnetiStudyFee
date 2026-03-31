package com.truongsonkmhd.unetistudy.dto.contest_lesson;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CodingAnswerDTO {
    String code;
    String language;
}
