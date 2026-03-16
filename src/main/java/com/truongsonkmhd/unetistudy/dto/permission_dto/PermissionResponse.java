package com.truongsonkmhd.unetistudy.dto.permission_dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermissionResponse {
    Long id;
    String name;
    String description;
}
