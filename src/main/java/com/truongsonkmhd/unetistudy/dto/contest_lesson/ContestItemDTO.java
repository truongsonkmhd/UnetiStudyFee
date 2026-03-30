package com.truongsonkmhd.unetistudy.dto.contest_lesson;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ContestItemDTO {
    UUID id;
    String type; // "CODING", "QUIZ"
    String title;
    String content;
    Integer points;
    
    // Quiz fields
    List<QuizOptionDTO> options;
    
    // Coding fields
    String programmingLanguage;
    String initialCode;
    String slug;
}
