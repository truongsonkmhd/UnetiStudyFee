package com.truongsonkmhd.unetistudy.service.infrastructure;

public interface EmailService {
    void sendOtpEmail(String to, String otp);
}
