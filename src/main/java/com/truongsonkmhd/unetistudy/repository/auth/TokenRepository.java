package com.truongsonkmhd.unetistudy.repository.auth;


import com.truongsonkmhd.unetistudy.model.Token;
import com.truongsonkmhd.unetistudy.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TokenRepository extends JpaRepository<Token, Long> {

    Token findByToken(String token);

    Optional<Token> findByUserId(UUID userId);

    Optional<Token> findByUser(User user);

    Optional<Token> findByRefreshToken(String refreshToken);
}
