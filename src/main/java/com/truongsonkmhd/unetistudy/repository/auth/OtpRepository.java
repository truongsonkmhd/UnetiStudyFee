package com.truongsonkmhd.unetistudy.repository.auth;

import com.truongsonkmhd.unetistudy.model.Otp;
import com.truongsonkmhd.unetistudy.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OtpRepository extends JpaRepository<Otp, UUID> {
    Optional<Otp> findByUserAndOtpCodeAndUsedFalse(User user, String otpCode);
}

