package com.truongsonkmhd.unetistudy.security;

import org.springframework.security.core.userdetails.UserDetails;

import java.util.UUID;

public interface JwtService {
    String generateToken(MyUserDetail myUserDetail,  boolean isRememberMe);

    String generateRefreshToken(MyUserDetail myUserDetail, boolean isRememberMe);

    String extractUsername(String token);

    boolean isValid(String token, UserDetails user);

    boolean validateToken(String token);

    UUID extractUserID(String token);
}
