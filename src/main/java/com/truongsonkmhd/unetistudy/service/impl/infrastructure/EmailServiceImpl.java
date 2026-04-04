package com.truongsonkmhd.unetistudy.service.impl.infrastructure;

import com.truongsonkmhd.unetistudy.service.infrastructure.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendOtpEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Mã OTP khôi phục mật khẩu - Uneti Study");
        message.setText("Chào bạn,\n\n" +
                "Mã OTP để khôi phục mật khẩu của bạn là: " + otp + "\n" +
                "Mã này có hiệu lực trong 2 phút. Vui lòng không cung cấp mã này cho bất kỳ ai.\n\n" +
                "Trân trọng,\n" +
                "Uneti Study Team");

        try {
            mailSender.send(message);
            log.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Could not send email. Please try again later.");
        }
    }
}
