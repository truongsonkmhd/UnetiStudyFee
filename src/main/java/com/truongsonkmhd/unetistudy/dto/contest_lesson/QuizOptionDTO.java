package com.truongsonkmhd.unetistudy.dto.contest_lesson;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizOptionDTO {
    UUID id;
    String text;
}
