package com.truongsonkmhd.unetistudy.dto.auth_dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SignInDTORequest implements Serializable {
     String username;
     String password;
     String platform; // web , mobile , miniApp
     String deviceToken; // thieets bij mobile cần cái này để insert vào database de có action push notifi nào sẽ push thneo deviceToken đến đến app đấy
     String versionApp;
}
