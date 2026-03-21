package com.truongsonkmhd.unetistudy.service.impl.auth;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.SignedJWT;
import com.truongsonkmhd.unetistudy.common.UserStatus;
import com.truongsonkmhd.unetistudy.dto.auth_dto.*;
import com.truongsonkmhd.unetistudy.exception.AppException;
import com.truongsonkmhd.unetistudy.exception.ErrorCode;
import com.truongsonkmhd.unetistudy.exception.payload.DataNotFoundException;
import com.truongsonkmhd.unetistudy.model.InvalidatedToken;
import com.truongsonkmhd.unetistudy.model.Role;
import com.truongsonkmhd.unetistudy.model.Token;
import com.truongsonkmhd.unetistudy.model.User;
import com.truongsonkmhd.unetistudy.model.StudentProfile;
import com.truongsonkmhd.unetistudy.repository.auth.InvalidatedTokenRepository;
import com.truongsonkmhd.unetistudy.repository.auth.RoleRepository;
import com.truongsonkmhd.unetistudy.repository.auth.TokenRepository;
import com.truongsonkmhd.unetistudy.repository.UserRepository;
import com.truongsonkmhd.unetistudy.repository.StudentProfileRepository;
import com.truongsonkmhd.unetistudy.security.JwtService;
import com.truongsonkmhd.unetistudy.security.MyUserDetail;
import com.truongsonkmhd.unetistudy.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.ParseException;
import java.time.Instant;
import java.util.Date;
import java.util.HashSet;
import java.util.List;

import static com.truongsonkmhd.unetistudy.common.UserStatus.ACTIVE;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "AUTHENTICATION-SERVICE")
public class AuthenticationServiceImpl implements AuthenticationService {

    @Value("${security.jwt.refresh-token-validity-in-seconds}")
    private long refreshTokenExpirationSeconds;

    @Value("${security.jwt.token-validity-in-seconds}")
    private long accessTokenExpirationSeconds;

    @NonFinal
    @Value("${security.jwt.signerKey}")
    protected String SIGNER_KEY;
    @Value("${security.jwt.refresh-token-validity-in-seconds-for-remember-me}")
    private long refreshTokenExpirationSecondsRememberMe;

    private final UserRepository userRepository;

    private final RoleRepository roleRepository;

    private final TokenRepository tokenRepository;

    private final JwtService jwtService;

    private final PasswordEncoder passwordEncoder;

    private final InvalidatedTokenRepository invalidatedTokenRepository;

    private final StudentProfileRepository studentProfileRepository;

    @Transactional
    @Override
    public AuthenticationDTOResponse register(RegisterDTORequest request) {

        // 1. Check username trùng
        if (userRepository.findByUsername(request.getUserName()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        // 2. Check email trùng
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        if (userRepository.findByStudentProfile_StudentId(request.getStudentId()).isPresent()) {
            throw new RuntimeException("Student already exists");
        }

        // 3. Lấy danh sách role theo roleCodes
        List<Role> roles = roleRepository.findAllByCodes(request.getRoleCodes());

        // Set<RoleResponse> rolesSet = roles.stream()
        // .map(roleResponseMapper::toDto)
        // .collect(Collectors.toSet());

        if (roles.isEmpty()) {
            throw new RuntimeException("No roles found from roleCodes");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .username(request.getUserName())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .phone(request.getPhone())
                .gender(request.getGender())
                .birthday(request.getBirthday())
                .currentResidence(request.getCurrentResidence())
                .contactAddress(request.getContactAddress())
                .roles(new HashSet<>(roles))
                .isDeleted(false)
                .status(UserStatus.ACTIVE)
                .build();

        // 5. Save user
        userRepository.save(user);

        // 6. Save student profile
        StudentProfile studentProfile = StudentProfile.builder()
                .studentId(request.getStudentId())
                .classId(request.getClassId())
                .user(user)
                .build();
        studentProfileRepository.save(studentProfile);

        // 6. AUTO LOGIN – tạo token
        MyUserDetail detail = new MyUserDetail(user);

        String accessToken = jwtService.generateToken(detail, false);
        String refreshToken = jwtService.generateRefreshToken(detail, false);

        Instant now = Instant.now();

        Token token = tokenRepository.findByUser(user).orElse(new Token());
        token.setUser(user);
        token.setToken(accessToken);
        token.setRefreshToken(refreshToken);
        token.setExpirationTime(now.plusSeconds(accessTokenExpirationSeconds));
        token.setRefreshExpirationTime(now.plusSeconds(refreshTokenExpirationSeconds));
        token.setTokenType("Bearer");
        token.setExpired(false);
        token.setRevoked(false);

        tokenRepository.save(token);

        // 8. Trả về giống login → FE auto login luôn
        return createAuthenticationResponse(accessToken, refreshToken);
    }

    @Transactional
    @Override
    public AuthenticationDTOResponse authenticate(AuthenticationDTORequest request) {
        // 1) Lấy user + roles
        User user = userRepository
                .getByUsernameAndIsDeletedWithRoles(request.getUsername(), false)
                .orElseThrow(() -> new RuntimeException("User not found or deleted"));
        log.info("USER GET ROLE: {}", user.getRoles());

        // 2) Trạng thái
        if (!ACTIVE.equals(user.getStatus())) {
            throw new RuntimeException("User is not activated");
        }

        // 3) Check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        // 4) Tạo token
        boolean rememberMe = Boolean.TRUE.equals(request.getIsRememberMe());
        long rtTtl = rememberMe ? refreshTokenExpirationSecondsRememberMe : refreshTokenExpirationSeconds;

        MyUserDetail myUserDetail = new MyUserDetail(user);
        String accessToken = jwtService.generateToken(myUserDetail, rememberMe);
        String refreshToken = jwtService.generateRefreshToken(myUserDetail, rememberMe);

        log.info("Authorities: {}", myUserDetail.getAuthorities());

        Instant now = Instant.now();
        Instant accessExp = now.plusSeconds(accessTokenExpirationSeconds);
        Instant refreshExp = now.plusSeconds(rtTtl);

        // Nếu user đã có token → update thay vì insert
        Token dbToken = tokenRepository.findByUser(user).orElse(new Token());
        dbToken.setUser(user);
        dbToken.setToken(accessToken);
        dbToken.setRefreshToken(refreshToken);
        dbToken.setTokenType("Bearer");
        dbToken.setExpirationTime(accessExp);
        dbToken.setRefreshExpirationTime(refreshExp);
        dbToken.setRevoked(false);
        dbToken.setExpired(false);
        tokenRepository.save(dbToken);

        return createAuthenticationResponse(accessToken, refreshToken);
    }

    @Transactional
    @Override
    public AuthenticationDTOResponse loginWithToken(String token) {
        String userName = jwtService.extractUsername(token);
        User user = this.userRepository.getByUsernameAndIsDeletedWithRoles(userName, false)
                .orElseThrow(() -> new UsernameNotFoundException("User not found!"));
        return createAuthenticationResponse(token, user.getToken().getRefreshToken());
    }

    @Transactional
    public AuthenticationDTOResponse refreshToken(String rawRefreshToken) {

        Token token = verifyRefreshToken(rawRefreshToken);

        if (token.getRefreshExpirationTime() == null || !token.getRefreshExpirationTime().isAfter(Instant.now())) {
            throw new RuntimeException("RefreshToken is expired!");
        }

        User user = token.getUser();
        MyUserDetail myUserDetail = new MyUserDetail(user);

        // Tạo mới cặp token
        String newAccessToken = jwtService.generateToken(myUserDetail, false);
        String newRefreshToken = jwtService.generateRefreshToken(myUserDetail, false);

        // Cập nhật đầy đủ record
        token.setToken(newAccessToken);
        token.setExpirationTime(Instant.now().plusSeconds(accessTokenExpirationSeconds));
        token.setRefreshToken(newRefreshToken);
        token.setRefreshExpirationTime(Instant.now().plusSeconds(refreshTokenExpirationSeconds));

        tokenRepository.save(token);

        return createAuthenticationResponse(newAccessToken, newRefreshToken);
    }

    private AuthenticationDTOResponse createAuthenticationResponse(String token, String refreshToken) {
        return AuthenticationDTOResponse.builder()
                .isAuthenticated(true)
                .token(token)
                .refreshToken(refreshToken)
                .build();
    }

    // private AuthenticationDTOResponse createAuthenticationResponse(String token,
    // String refreshToken, MyUserDetail myUserDetail , Set<RoleResponse> roles ) {
    // return AuthenticationDTOResponse.builder()
    // .isAuthenticated(true)
    // .token(token)
    // .refreshToken(refreshToken)
    // .user(UserResponse.builder()
    // .id(myUserDetail.user().getId())
    // .fullName(myUserDetail.user().getFullName())
    // .username(myUserDetail.user().getUsername())
    // .email(myUserDetail.user().getEmail())
    // .phone(myUserDetail.user().getPhone())
    // .birthday(myUserDetail.user().getBirthday())
    // .studentID(myUserDetail.user().getStudentId())
    // .gender(myUserDetail.user().getGender())
    // .classID(myUserDetail.user().getClassId())
    // .contactAddress(myUserDetail.user().getContactAddress())
    // .currentResidence(myUserDetail.user().getCurrentResidence())
    // .roles(roles)
    // .build())
    // .build();
    // }

    public Token verifyRefreshToken(String refreshToken) {
        Token token = tokenRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new DataNotFoundException("Invalid refresh token"));

        if (token.getExpirationTime().compareTo(Instant.now()) < 0) {
            tokenRepository.delete(token);
            throw new RuntimeException("Refresh token expired");
        }

        return token;
    }

    public IntrospectDTOResponse introspect(IntrospectDTORequest request)
            throws JOSEException, ParseException {
        var token = request.getToken();
        boolean isValid = true;

        try {
            verifyToken(token);
        } catch (AppException e) {
            isValid = false;
        }

        return IntrospectDTOResponse.builder()
                .valid(isValid)
                .build();
    }

    @Override
    public void logout(LogoutDTORequest request) throws ParseException, JOSEException {
        var signToken = verifyToken(request.getToken());

        String jit = signToken.getJWTClaimsSet().getJWTID();
        Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();

        InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                .id(jit)
                .expiryTime(expiryTime)
                .build();

        invalidatedTokenRepository.save(invalidatedToken);
    }

    private SignedJWT verifyToken(String token) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        var verified = signedJWT.verify(verifier);

        if (!verified)
            throw new AppException(ErrorCode.TOKEN_INVALID);

        if (expiryTime.before(new Date()))
            throw new AppException(ErrorCode.TOKEN_EXPIRED);

        if (invalidatedTokenRepository
                .existsById(signedJWT.getJWTClaimsSet().getJWTID()))
            throw new AppException(ErrorCode.TOKEN_INVALID);

        return signedJWT;
    }
}
