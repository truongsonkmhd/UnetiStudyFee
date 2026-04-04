package com.truongsonkmhd.unetistudy.dto.class_dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassQuickSearchResponse {
    private UUID classId;
    private String className;
    private String classCode;
    private String instructorName;
    private String inviteCode;
}
