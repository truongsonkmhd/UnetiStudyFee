package com.truongsonkmhd.unetistudy.dto.coding_submission;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CodingSubmissionShowDTO {
    String exerciseName;
    String userName;
    String code;
    String language;
    String status;
    Integer testCasesPassed;
    Integer totalTestCases;
    Integer score;
    Date submittedAt;

}
