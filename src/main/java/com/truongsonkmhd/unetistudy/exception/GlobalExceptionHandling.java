package com.truongsonkmhd.unetistudy.exception;

import com.truongsonkmhd.unetistudy.exception.custom_exception.*;
import com.truongsonkmhd.unetistudy.exception.custom_exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

@Slf4j
@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandling {

        @Value("${app.debug:false}")
        private boolean debugMode;

        // ==================== VALIDATION EXCEPTIONS ====================

        @ExceptionHandler(MethodArgumentNotValidException.class)
        @ResponseStatus(HttpStatus.BAD_REQUEST)
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "400", description = "Validation Failed", content = @Content(mediaType = APPLICATION_JSON_VALUE, schema = @Schema(implementation = ErrorResponse.class), examples = @ExampleObject(value = """
                                        {
                                          "timestamp": "2025-01-24T10:30:00Z",
                                          "status": 400,
                                          "error": "Bad Request",
                                          "message": "Validation failed for request body",
                                          "path": "/api/quiz-templates",
                                          "code": "VALIDATION_ERROR",
                                          "validationErrors": [
                                            {
                                              "field": "templateName",
                                              "rejectedValue": null,
                                              "message": "must not be blank"
                                            }
                                          ]
                                        }
                                        """)))
        })
        public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(
                        MethodArgumentNotValidException ex,
                        HttpServletRequest request) {

                log.warn("Validation failed: {}", ex.getMessage());

                List<ErrorResponse.ValidationError> validationErrors = ex.getBindingResult()
                                .getFieldErrors()
                                .stream()
                                .map(this::buildValidationError)
                                .collect(Collectors.toList());

                String message = validationErrors.stream()
                                .map(ErrorResponse.ValidationError::getMessage)
                                .collect(Collectors.joining(", "));

                if (message.isEmpty()) {
                        message = "Validation failed for request body";
                }

                ErrorResponse errorResponse = ErrorResponse.builder()
                                .timestamp(Instant.now())
                                .status(HttpStatus.BAD_REQUEST.value())
                                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                                .message(message)
                                .path(request.getRequestURI())
                                .code(ErrorCode.VALIDATION_ERROR.name())
                                .validationErrors(validationErrors)
                                .debugInfo(buildDebugInfo(ex))
                                .build();

                return ResponseEntity.badRequest().body(errorResponse);
        }

        @ExceptionHandler(ConstraintViolationException.class)
        @ResponseStatus(HttpStatus.BAD_REQUEST)
        public ResponseEntity<ErrorResponse> handleConstraintViolation(
                        ConstraintViolationException ex,
                        HttpServletRequest request) {

                log.warn("Constraint violation: {}", ex.getMessage());

                List<ErrorResponse.ValidationError> validationErrors = ex.getConstraintViolations()
                                .stream()
                                .map(this::buildValidationError)
                                .collect(Collectors.toList());

                String message = validationErrors.stream()
                                .map(ErrorResponse.ValidationError::getMessage)
                                .collect(Collectors.joining(", "));

                if (message.isEmpty()) {
                        message = "Validation failed for request parameters";
                }

                ErrorResponse errorResponse = ErrorResponse.builder()
                                .timestamp(Instant.now())
                                .status(HttpStatus.BAD_REQUEST.value())
                                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                                .message(message)
                                .path(request.getRequestURI())
                                .code(ErrorCode.VALIDATION_ERROR.name())
                                .validationErrors(validationErrors)
                                .debugInfo(buildDebugInfo(ex))
                                .build();

                return ResponseEntity.badRequest().body(errorResponse);
        }

        @ExceptionHandler(MissingServletRequestParameterException.class)
        @ResponseStatus(HttpStatus.BAD_REQUEST)
        public ResponseEntity<ErrorResponse> handleMissingParameter(
                        MissingServletRequestParameterException ex,
                        HttpServletRequest request) {

                log.warn("Missing parameter: {}", ex.getParameterName());

                ErrorResponse errorResponse = ErrorResponse.builder()
                                .timestamp(Instant.now())
                                .status(HttpStatus.BAD_REQUEST.value())
                                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                                .message(String.format("Required parameter '%s' is missing", ex.getParameterName()))
                                .path(request.getRequestURI())
                                .code(ErrorCode.MISSING_PARAMETER.name())
                                .debugInfo(buildDebugInfo(ex))
                                .build();

                return ResponseEntity.badRequest().body(errorResponse);
        }

        @ExceptionHandler(MethodArgumentTypeMismatchException.class)
        @ResponseStatus(HttpStatus.BAD_REQUEST)
        public ResponseEntity<ErrorResponse> handleTypeMismatch(
                        MethodArgumentTypeMismatchException ex,
                        HttpServletRequest request) {

                log.warn("Type mismatch: {}", ex.getMessage());

                String message = String.format("Parameter '%s' should be of type '%s'",
                                ex.getName(),
                                ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown");

                ErrorResponse errorResponse = ErrorResponse.builder()
                                .timestamp(Instant.now())
                                .status(HttpStatus.BAD_REQUEST.value())
                                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                                .message(message)
                                .path(request.getRequestURI())
                                .code(ErrorCode.INVALID_PARAMETER.name())
                                .debugInfo(buildDebugInfo(ex))
                                .build();

                return ResponseEntity.badRequest().body(errorResponse);
        }

        // ==================== AUTHENTICATION & AUTHORIZATION ====================

        @ExceptionHandler({ InternalAuthenticationServiceException.class, BadCredentialsException.class })
        @ResponseStatus(HttpStatus.UNAUTHORIZED)
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = APPLICATION_JSON_VALUE, examples = @ExampleObject(value = """
                                        {
                                          "timestamp": "2025-01-24T10:30:00Z",
                                          "status": 401,
                                          "error": "Unauthorized",
                                          "message": "Invalid username or password",
                                          "path": "/api/auth/login",
                                          "code": "INVALID_CREDENTIALS"
                                        }
                                        """)))
        })
        public ResponseEntity<ErrorResponse> handleAuthenticationException(
                        Exception ex,
                        HttpServletRequest request) {

                log.warn("Authentication failed: {}", ex.getMessage());

                ErrorResponse errorResponse = ErrorResponse.builder()
                                .timestamp(Instant.now())
                                .status(HttpStatus.UNAUTHORIZED.value())
                                .error(HttpStatus.UNAUTHORIZED.getReasonPhrase())
                                .message("Invalid username or password")
                                .path(request.getRequestURI())
                                .code(ErrorCode.INVALID_CREDENTIALS.name())
                                .build();

                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }

        @ExceptionHandler({ AccessDeniedException.class, ForbiddenException.class })
        @ResponseStatus(HttpStatus.FORBIDDEN)
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(mediaType = APPLICATION_JSON_VALUE, examples = @ExampleObject(value = """
                                        {
                                          "timestamp": "2025-01-24T10:30:00Z",
                                          "status": 403,
                                          "error": "Forbidden",
                                          "message": "You don't have permission to access this resource",
                                          "path": "/api/quiz-templates",
                                          "code": "FORBIDDEN"
                                        }
                                        """)))
        })
        public ResponseEntity<ErrorResponse> handleAccessDeniedException(
                        Exception ex,
                        HttpServletRequest request) {

                log.warn("Access denied: {}", ex.getMessage());

                ErrorResponse errorResponse = ErrorResponse.builder()
                                .timestamp(Instant.now())
                                .status(HttpStatus.FORBIDDEN.value())
                                .error(HttpStatus.FORBIDDEN.getReasonPhrase())
                                .message(ex.getMessage() != null ? ex.getMessage() : "Access forbidden")
                                .path(request.getRequestURI())
                                .code(ErrorCode.FORBIDDEN.name())
                                .build();

                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
        }

        // ==================== RESOURCE EXCEPTIONS ====================

        @ExceptionHandler(ResourceNotFoundException.class)
        @ResponseStatus(HttpStatus.NOT_FOUND)
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "404", description = "Not Found", content = @Content(mediaType = APPLICATION_JSON_VALUE, examples = @ExampleObject(value = """
                                        {
                                          "timestamp": "2025-01-24T10:30:00Z",
                                          "status": 404,
                                          "error": "Not Found",
                                          "message": "Quiz template not found with id: 123",
                                          "path": "/api/quiz-templates/123",
                                          "code": "RESOURCE_NOT_FOUND"
                                        }
                                        """)))
        })
        public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
                        ResourceNotFoundException ex,
                        HttpServletRequest request) {

                log.warn("Resource not found: {}", ex.getMessage());

                ErrorResponse errorResponse = ErrorResponse.builder()
                                .timestamp(Instant.now())
                                .status(HttpStatus.NOT_FOUND.value())
                                .error(HttpStatus.NOT_FOUND.getReasonPhrase())
                                .message(ex.getMessage())
                                .path(request.getRequestURI())
                                .code(ex.getErrorCode().name())
                                .build();

                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }

        @ExceptionHandler(NoHandlerFoundException.class)
        @ResponseStatus(HttpStatus.NOT_FOUND)
        public ResponseEntity<ErrorResponse> handleNoHandlerFound(
                        NoHandlerFoundException ex,
                        HttpServletRequest request) {

                log.warn("Endpoint not found: {}", ex.getRequestURL());

                ErrorResponse errorResponse = ErrorResponse.builder()
                                .timestamp(Instant.now())
                                .status(HttpStatus.NOT_FOUND.value())
                                .error(HttpStatus.NOT_FOUND.getReasonPhrase())
                                .message(String.format("Endpoint '%s' not found", ex.getRequestURL()))
                                .path(request.getRequestURI())
                                .code(ErrorCode.ENDPOINT_NOT_FOUND.name())
                                .build();

                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }

        // ==================== CONFLICT EXCEPTIONS ====================

        @ExceptionHandler({ InvalidDataException.class, ResourceConflictException.class })
        @ResponseStatus(HttpStatus.CONFLICT)
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "409", description = "Conflict", content = @Content(mediaType = APPLICATION_JSON_VALUE, examples = @ExampleObject(value = """
                                        {
                                          "timestamp": "2025-01-24T10:30:00Z",
                                          "status": 409,
                                          "error": "Conflict",
                                          "message": "Quiz template with name 'Math Quiz' already exists",
                                          "path": "/api/quiz-templates",
                                          "code": "RESOURCE_CONFLICT"
                                        }
                                        """)))
        })
        public ResponseEntity<ErrorResponse> handleConflictException(
                        BaseException ex,
                        HttpServletRequest request) {

                log.warn("Resource conflict: {}", ex.getMessage());

                ErrorResponse errorResponse = ErrorResponse.builder()
                                .timestamp(Instant.now())
                                .status(HttpStatus.CONFLICT.value())
                                .error(HttpStatus.CONFLICT.getReasonPhrase())
                                .message(ex.getMessage())
                                .path(request.getRequestURI())
                                .code(ex.getErrorCode().name())
                                .build();

                return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
        }

        @ExceptionHandler({
                        org.springframework.dao.OptimisticLockingFailureException.class,
                        jakarta.persistence.OptimisticLockException.class,
                        OptimisticLockException.class
        })
        @ResponseStatus(HttpStatus.CONFLICT)
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "409", description = "Optimistic Lock Conflict", content = @Content(mediaType = APPLICATION_JSON_VALUE, examples = @ExampleObject(value = """
                                        {
                                          "timestamp": "2025-01-24T10:30:00Z",
                                          "status": 409,
                                          "error": "Conflict",
                                          "message": "The resource has been modified by another user. Please refresh and try again.",
                                          "path": "/api/quiz-templates/123",
                                          "code": "OPTIMISTIC_LOCK_ERROR"
                                        }
                                        """)))
        })
        public ResponseEntity<ErrorResponse> handleOptimisticLockException(
                        Exception ex,
                        HttpServletRequest request) {

                log.warn("Optimistic lock exception: {}", ex.getMessage());

                ErrorResponse errorResponse = ErrorResponse.builder()
                                .timestamp(Instant.now())
                                .status(HttpStatus.CONFLICT.value())
                                .error(HttpStatus.CONFLICT.getReasonPhrase())
                                .message("The resource has been modified by another user. Please refresh and try again.")
                                .path(request.getRequestURI())
                                .code(ErrorCode.OPTIMISTIC_LOCK_ERROR.name())
                                .debugInfo(buildDebugInfo(ex))
                                .build();

                return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
        }

        @ExceptionHandler(DataIntegrityViolationException.class)
        public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(
                        DataIntegrityViolationException ex,
                        HttpServletRequest request) {

                log.error("Data integrity violation: {}", ex.getMessage());

                String message = "Data integrity violation occurred";
                HttpStatus status = HttpStatus.CONFLICT;
                ErrorCode errorCode = ErrorCode.DATA_INTEGRITY_VIOLATION;

                if (ex.getMessage() != null) {
                        String detail = ex.getMessage();
                        if (detail.contains("unique constraint") || detail.contains("Duplicate entry")) {
                                message = "A record with this information already exists (unique constraint violation)";
                        } else if (detail.contains("foreign key constraint")) {
                                message = "Cannot perform operation due to related data (foreign key constraint violation)";
                        } else if (detail.contains("null value") || detail.contains("violates not-null constraint")) {
                                message = "Required information is missing (null value constraint violation)";
                                status = HttpStatus.BAD_REQUEST;
                                errorCode = ErrorCode.INVALID_DATA;
                        }
                }

                ErrorResponse errorResponse = ErrorResponse.builder()
                                .timestamp(Instant.now())
                                .status(status.value())
                                .error(status.getReasonPhrase())
                                .message(message)
                                .path(request.getRequestURI())
                                .code(errorCode.name())
                                .debugInfo(buildDebugInfo(ex))
                                .build();

                return ResponseEntity.status(status).body(errorResponse);
        }

        // ==================== BUSINESS LOGIC EXCEPTIONS ====================

        @ExceptionHandler(BusinessRuleException.class)
        @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
        public ResponseEntity<ErrorResponse> handleBusinessRuleException(
                        BusinessRuleException ex,
                        HttpServletRequest request) {

                log.warn("Business rule violation: {}", ex.getMessage());

                ErrorResponse errorResponse = ErrorResponse.builder()
                                .timestamp(Instant.now())
                                .status(HttpStatus.UNPROCESSABLE_ENTITY.value())
                                .error(HttpStatus.UNPROCESSABLE_ENTITY.getReasonPhrase())
                                .message(ex.getMessage())
                                .path(request.getRequestURI())
                                .code(ex.getErrorCode().name())
                                .build();

                return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(errorResponse);
        }

        @ExceptionHandler(IllegalStateException.class)
        @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
        public ResponseEntity<ErrorResponse> handleIllegalStateException(
                        IllegalStateException ex,
                        HttpServletRequest request) {

                log.warn("Illegal state: {}", ex.getMessage());

                ErrorResponse errorResponse = ErrorResponse.builder()
                                .timestamp(Instant.now())
                                .status(HttpStatus.UNPROCESSABLE_ENTITY.value())
                                .error(HttpStatus.UNPROCESSABLE_ENTITY.getReasonPhrase())
                                .message(ex.getMessage())
                                .path(request.getRequestURI())
                                .code(ErrorCode.INVALID_STATE_TRANSITION.name())
                                .debugInfo(buildDebugInfo(ex))
                                .build();

                return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(errorResponse);
        }

        // ==================== GENERIC EXCEPTION ====================

        @ExceptionHandler(Exception.class)
        @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "500", description = "Internal Server Error", content = @Content(mediaType = APPLICATION_JSON_VALUE, examples = @ExampleObject(value = """
                                        {
                                          "timestamp": "2025-01-24T10:30:00Z",
                                          "status": 500,
                                          "error": "Internal Server Error",
                                          "message": "An unexpected error occurred. Please try again later.",
                                          "path": "/api/quiz-templates",
                                          "code": "INTERNAL_SERVER_ERROR"
                                        }
                                        """)))
        })
        public ResponseEntity<ErrorResponse> handleGenericException(
                        Exception ex,
                        HttpServletRequest request) {

                log.error("Unexpected error occurred", ex);

                ErrorResponse errorResponse = ErrorResponse.builder()
                                .timestamp(Instant.now())
                                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                                .error(HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase())
                                .message("An unexpected error occurred. Please try again later.")
                                .path(request.getRequestURI())
                                .code(ErrorCode.INTERNAL_SERVER_ERROR.name())
                                .debugInfo(buildDebugInfo(ex))
                                .build();

                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }

        // ==================== HELPER METHODS ====================

        private ErrorResponse.ValidationError buildValidationError(FieldError fieldError) {
                return ErrorResponse.ValidationError.builder()
                                .field(fieldError.getField())
                                .rejectedValue(fieldError.getRejectedValue())
                                .message(fieldError.getDefaultMessage())
                                .build();
        }

        private ErrorResponse.ValidationError buildValidationError(ConstraintViolation<?> violation) {
                String field = violation.getPropertyPath().toString();
                // Extract field name from path (e.g., "updateTemplate.request.templateName" ->
                // "templateName")
                if (field.contains(".")) {
                        field = field.substring(field.lastIndexOf('.') + 1);
                }

                return ErrorResponse.ValidationError.builder()
                                .field(field)
                                .rejectedValue(violation.getInvalidValue())
                                .message(violation.getMessage())
                                .build();
        }

        private Map<String, Object> buildDebugInfo(Exception ex) {
                if (!debugMode) {
                        return null;
                }

                Map<String, Object> debugInfo = new HashMap<>();
                debugInfo.put("exceptionClass", ex.getClass().getName());
                debugInfo.put("exceptionMessage", ex.getMessage());

                if (ex.getCause() != null) {
                        debugInfo.put("cause", ex.getCause().getMessage());
                }

                // Add stack trace only in debug mode
                List<String> stackTrace = new ArrayList<>();
                for (int i = 0; i < Math.min(5, ex.getStackTrace().length); i++) {
                        stackTrace.add(ex.getStackTrace()[i].toString());
                }
                debugInfo.put("stackTrace", stackTrace);

                return debugInfo;
        }
}