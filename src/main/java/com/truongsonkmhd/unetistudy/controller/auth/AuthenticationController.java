package com.truongsonkmhd.unetistudy.controller.auth;

import com.nimbusds.jose.JOSEException;
import com.truongsonkmhd.unetistudy.dto.auth_dto.*;
import com.truongsonkmhd.unetistudy.dto.a_custom.ApiResponse;
import com.truongsonkmhd.unetistudy.dto.a_common.IResponseMessage;
import com.truongsonkmhd.unetistudy.dto.a_common.ResponseMessage;
import com.truongsonkmhd.unetistudy.service.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;

@RestController
@RequestMapping("/api/authenticate")
@Slf4j(topic = "AUTHENTICATION-CONTROLLER")
@Tag(name = "Authentication Controller")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @PostMapping("")
    @Operation(summary = "Đăng nhập tài khoản")
    ResponseEntity<IResponseMessage> login(@RequestBody AuthenticationDTORequest request) {
        AuthenticationDTOResponse authenticateResponse = this.authenticationService.authenticate(request);
        return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(authenticateResponse));
    }

    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản")
    ResponseEntity<IResponseMessage> register(@RequestBody RegisterDTORequest req) {
        AuthenticationDTOResponse authenticationDTOResponse = this.authenticationService.register(req);
        return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(authenticationDTOResponse));
    }

    @PostMapping("/login-with-token")
    @Operation(summary = "Đăng nhập tài khoản với token")
    ResponseEntity<IResponseMessage> loginWithToken(@RequestBody RefreshTokenDTORequest req) {
        AuthenticationDTOResponse authenticationDTOResponse = this.authenticationService
                .loginWithToken(req.getRefreshToken());
        return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(authenticationDTOResponse));
    }

    @PostMapping("/refresh-token")
    ResponseEntity<IResponseMessage> login(@RequestBody RefreshTokenDTORequest req) {
        AuthenticationDTOResponse authenticateResponse = this.authenticationService.refreshToken(req.getRefreshToken());
        return ResponseEntity.ok().body(ResponseMessage.LoadedSuccess(authenticateResponse));
    }

    @PostMapping("/introspect")
    ApiResponse<IntrospectDTOResponse> authenticate(@RequestBody IntrospectDTORequest request)
            throws ParseException, JOSEException {
        var result = authenticationService.introspect(request);
        return ApiResponse.<IntrospectDTOResponse>builder()
                .result(result)
                .build();
    }

    @PostMapping("/logout")
    @Operation(summary = "Đăng xuất tài khoản")
    ApiResponse<Void> logout(@RequestBody LogoutDTORequest request)
            throws ParseException, JOSEException {
        authenticationService.logout(request);
        return ApiResponse.<Void>builder()
                .build();
    }

    // B1: Thêm id cho claimset
    // B2: tạo một cái entity giữ thông tin token đã bị logout
    //
    // B3: tạo api logout (verify + save vào bảng invalidedToken
    // B4: update introspect để check xem token còn tồn hiệu lực không, có trong
    // bảng invalided không

}
