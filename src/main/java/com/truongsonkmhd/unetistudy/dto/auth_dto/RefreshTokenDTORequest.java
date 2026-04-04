package com.truongsonkmhd.unetistudy.dto.auth_dto;


import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)

public class RefreshTokenDTORequest {
    String refreshToken;
}
