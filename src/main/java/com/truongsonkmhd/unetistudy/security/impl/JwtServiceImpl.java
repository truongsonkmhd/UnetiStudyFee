package com.truongsonkmhd.unetistudy.security.impl;

import com.truongsonkmhd.unetistudy.common.UserStatus;
import com.truongsonkmhd.unetistudy.model.Token;
import com.truongsonkmhd.unetistudy.model.User;
import com.truongsonkmhd.unetistudy.repository.auth.TokenRepository;
import com.truongsonkmhd.unetistudy.security.JwtService;
import com.truongsonkmhd.unetistudy.security.MyUserDetail;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.security.Key;
import java.util.*;
import java.util.function.Function;

@Service
@Slf4j(topic = "JWT-SERVICE")
@RequiredArgsConstructor
public class JwtServiceImpl implements JwtService {

    @Value("${jhipster.security.authentication.jwt.base64-secret}")
    private String secretKey;

    @Value("${jhipster.security.authentication.jwt.token-validity-in-seconds}")
    private long jwtExpiration;

    @Value("${jhipster.security.authentication.jwt.token-validity-in-seconds-for-remember-me}")
    private long jwtExpirationRememberMe;

    @Value("${security.jwt.refresh-token-validity-in-seconds}")
    private long refreshExpiration;

    @Value("${security.jwt.refresh-token-validity-in-seconds-for-remember-me}")
    private long refreshExpirationRememberMe;

    public static final String CLAIM_USER_ID = "userID";
    public static final String CLAIM_USER_NAME = "userName";
    public static final String CLAIM_USER_AVATAR = "avatar";
    public static final String CLAIM_USER_CLASS_ID = "classId";
    public static final String SCOPE = "scope";

    private final TokenRepository tokenRepository;

    public static final String[] WHITE_LIST_URL = {
            "/api/v1/auth/**",
            "/api/authenticate/**",
            "ws-submission/**"
    };

    @Override
    public String extractUsername(String token) {
        Claims claims = extractAllClaims(token);
        // Sửa: Lấy từ claim "userName" thay vì subject
        String username = claims.get(CLAIM_USER_NAME, String.class);
        // Fallback sang subject nếu userName null
        return username != null ? username : claims.getSubject();
    }

    @Override
    public boolean isValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    @Override
    public String generateRefreshToken(MyUserDetail myUserDetail, boolean isRememberMe) {
        return buildToken(new HashMap<>(), myUserDetail,
                isRememberMe ? refreshExpirationRememberMe : refreshExpiration);
    }

    @Override
    public String generateToken(MyUserDetail myUserDetail, boolean isRememberMe) {
        User user = myUserDetail.user();
        Map<String, Object> claims = new HashMap<>();
        claims.put(CLAIM_USER_ID, user.getId().toString());
        claims.put(CLAIM_USER_NAME, user.getUsername());
        claims.put(CLAIM_USER_AVATAR, user.getAvatar());
        claims.put(SCOPE, buildScope(myUserDetail));
        return generateToken(claims, myUserDetail, isRememberMe);
    }

    public String generateToken(
            Map<String, Object> extraClaims,
            MyUserDetail myUserDetail,
            boolean isRememberMe
    ) {
        return buildToken(extraClaims, myUserDetail,
                isRememberMe ? jwtExpirationRememberMe : jwtExpiration);
    }

    public String buildToken(Map<String, Object> extractClaims,
                             MyUserDetail myUserDetail,
                             long expiration) {
        try {
            return Jwts
                    .builder()
                    .setClaims(extractClaims)
                    .setSubject(myUserDetail.getUsername())
                    .setIssuedAt(new Date(System.currentTimeMillis()))
                    .setExpiration(new Date(System.currentTimeMillis() + (expiration * 1000))) // Sửa: nhân 1000 để convert sang milliseconds
                    .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                    .compact();
        } catch (Exception e) {
            log.error("Error building token: {}", e.getMessage());
            return null;
        }
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token); // Sửa: dùng extractUsername thay vì extractPhoneNumber
        Token existingToken = tokenRepository.findByToken(token);

        if (existingToken == null ||
                existingToken.isRevoked() ||
                !(existingToken.getUser().getStatus() == UserStatus.ACTIVE)) {
            return false;
        }
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    // Giữ lại method này để backward compatible
    public String extractPhoneNumber(String token) {
        return extractUsername(token);
    }

    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private String buildScope(MyUserDetail myUserDetail) {
        StringJoiner stringJoiner = new StringJoiner(" ");
        if (!CollectionUtils.isEmpty(myUserDetail.user().getRoles())) {
            myUserDetail.user().getRoles().forEach(role -> {
                stringJoiner.add(role.getCode());
                if (!CollectionUtils.isEmpty(role.getPermissions())) {
                    role.getPermissions()
                            .forEach(permission -> stringJoiner.add(permission.getName()));
                }
            });
        }
        return stringJoiner.toString();
    }

    @Override
    public boolean validateToken(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (Exception e) {
            log.error("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public UUID extractUserID(String token) {
        try {
            Claims claims = extractAllClaims(token);
            String userIdStr = claims.get(CLAIM_USER_ID, String.class);
            return userIdStr != null ? UUID.fromString(userIdStr) : null;
        } catch (Exception e) {
            log.error("Error extracting userID: {}", e.getMessage());
            return null;
        }
    }
}