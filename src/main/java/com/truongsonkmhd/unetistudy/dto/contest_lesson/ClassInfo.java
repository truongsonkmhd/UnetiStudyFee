package com.truongsonkmhd.unetistudy.dto.contest_lesson;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassInfo {
    UUID classId;
    String classCode;
    String className;
    String instructorName;
}