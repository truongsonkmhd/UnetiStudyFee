package com.truongsonkmhd.unetistudy.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
@Setter
@Data
@Entity
@Table(name = "tbl_token")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Token {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "token", nullable = false, unique = true, columnDefinition = "TEXT")
    String token;

    @Column(name = "refresh_token", nullable = false, columnDefinition = "TEXT")
    String refreshToken;

    @Column(name = "token_type", nullable = false, length = 50)
    String tokenType;

    @Column(name = "expiration_time", nullable = false)
    Instant expirationTime; // thời gian sống của token

    @Column(name = "refresh_expiration_time", nullable = false)
    Instant refreshExpirationTime; // thời gian sống của refresh token

    @Column(name = "revoked", nullable = false)
    boolean revoked;// đã bị thu hồi hay chưa (dù chưa quá hạn).

    @Column(name = "expired", nullable = false)
    boolean expired; // flag kết hợp với expirationTime.

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", unique = true)
    User user;

    public static Token create(User user, String accessToken, String refreshToken,
            Instant accessExp, Instant refreshExp) {
        return Token.builder()
                .user(user)
                .token(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expirationTime(accessExp)
                .refreshExpirationTime(refreshExp)
                .revoked(false)
                .expired(false)
                .build();
    }

}
