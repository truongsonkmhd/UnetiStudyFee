package com.truongsonkmhd.unetistudy.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // 400 - Bad Request
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "Validation failed"),
    INVALID_PARAMETER(HttpStatus.BAD_REQUEST, "Invalid parameter"),
    INVALID_PAYLOAD(HttpStatus.BAD_REQUEST, "Invalid request payload"),
    INVALID_DATA(HttpStatus.BAD_REQUEST, "Invalid data"),
    MISSING_PARAMETER(HttpStatus.BAD_REQUEST, "Required parameter is missing"),

    // 401 - Unauthorized
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "Authentication required"),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "Invalid username or password"),
    TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "Token has expired"),
    TOKEN_INVALID(HttpStatus.UNAUTHORIZED, "Invalid token"),

    // 403 - Forbidden
    FORBIDDEN(HttpStatus.FORBIDDEN, "Access forbidden"),
    INSUFFICIENT_PERMISSIONS(HttpStatus.FORBIDDEN, "Insufficient permissions"),

    // 404 - Not Found
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "Resource not found"),
    ENDPOINT_NOT_FOUND(HttpStatus.NOT_FOUND, "Endpoint not found"),

    // 409 - Conflict
    RESOURCE_CONFLICT(HttpStatus.CONFLICT, "Resource already exists"),
    OPTIMISTIC_LOCK_ERROR(HttpStatus.CONFLICT, "Resource has been modified by another user"),
    DATA_INTEGRITY_VIOLATION(HttpStatus.CONFLICT, "Data integrity violation"),

    // 422 - Unprocessable Entity
    BUSINESS_RULE_VIOLATION(HttpStatus.UNPROCESSABLE_ENTITY, "Business rule violation"),
    INVALID_STATE_TRANSITION(HttpStatus.UNPROCESSABLE_ENTITY, "Invalid state transition"),

    // 500 - Internal Server Error
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error occurred"),
    DATABASE_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Database error occurred"),
    EXTERNAL_SERVICE_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "External service error");

    private final HttpStatus httpStatus;
    private final String defaultMessage;

    public int getStatusCode() {
        return httpStatus.value();
    }

    public String getStatusReason() {
        return httpStatus.getReasonPhrase();
    }
}