package com.truongsonkmhd.unetistudy.exception;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Standard error response")
public class ErrorResponse {

    @Schema(description = "Timestamp when error occurred", example = "2025-01-24T10:30:00Z")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'", timezone = "UTC")
    Instant timestamp;

    @Schema(description = "HTTP status code", example = "400")
    int status;

    @Schema(description = "HTTP status reason phrase", example = "Bad Request")
    String error;

    @Schema(description = "Error message", example = "Validation failed")
    String message;

    @Schema(description = "Request path", example = "/api/v1/quiz-templates")
    String path;

    @Schema(description = "Error code for client handling", example = "VALIDATION_ERROR")
    String code;

    @Schema(description = "Validation errors details")
    List<ValidationError> validationErrors;

    @Schema(description = "Additional debug information (only in dev mode)")
    Map<String, Object> debugInfo;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class ValidationError {

        @Schema(description = "Field name", example = "templateName")
        String field;

        @Schema(description = "Rejected value")
        Object rejectedValue;

        @Schema(description = "Error message", example = "must not be blank")
        String message;
    }
}