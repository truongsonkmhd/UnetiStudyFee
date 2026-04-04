package com.truongsonkmhd.unetistudy.dto.auth_dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.Set;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class AuthenticationUser implements Serializable {

    UUID id;
    String email;
    String name;
    String avatar;
    Boolean isSupperUser;
    Set<String> roles;
}
