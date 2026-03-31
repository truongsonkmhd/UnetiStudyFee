package com.truongsonkmhd.unetistudy.dto.contest_lesson;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContestSubmissionResult {
    private String submissionId;
    private double quizScore;
    private double codingScore;
    private double totalScore;
    private double maxScore;
    private boolean passed;
    private String message;
}
