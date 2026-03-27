package com.truongsonkmhd.unetistudy.service;

import com.nimbusds.jose.JOSEException;
import com.truongsonkmhd.unetistudy.dto.auth_dto.*;

import java.text.ParseException;

public interface AuthenticationService {

    AuthenticationDTOResponse loginWithToken(String token);

    AuthenticationDTOResponse refreshToken(String refreshToken);

    AuthenticationDTOResponse authenticate(AuthenticationDTORequest request);

    AuthenticationDTOResponse register(RegisterDTORequest request);

    void logout(LogoutDTORequest request) throws ParseException, JOSEException;

    IntrospectDTOResponse introspect(IntrospectDTORequest request) throws JOSEException, ParseException;

    void forgotPasswordRequest(String email);

    void verifyOtp(String email, String otp);

    void resetPassword(String email, String otp, String newPassword);
}
