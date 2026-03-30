package com.truongsonkmhd.unetistudy.dto.contest_lesson;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ContestSubmissionRequest {

    /** Quiz: questionId -> list of selected answerIds */
    Map<UUID, List<UUID>> quizAnswers;

    /** Coding: exerciseId -> { code, language } */
    Map<UUID, CodingAnswerDTO> codingAnswers;
}
