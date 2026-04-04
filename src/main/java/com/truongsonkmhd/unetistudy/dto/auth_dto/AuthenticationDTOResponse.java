package com.truongsonkmhd.unetistudy.dto.auth_dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthenticationDTOResponse {
     Boolean isAuthenticated;
     String token;
     String refreshToken;
}

