package com.truongsonkmhd.unetistudy.dto.contest_exercise_attempt;


import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AttemptInfoDTO {
     UUID lessonID;
     String exerciseType;
     Integer attemptNumber;
}
