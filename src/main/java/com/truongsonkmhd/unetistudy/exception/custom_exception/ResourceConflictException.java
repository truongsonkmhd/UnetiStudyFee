package com.truongsonkmhd.unetistudy.exception.custom_exception;

import com.truongsonkmhd.unetistudy.exception.ErrorCode;

/**
 * Exception for resource conflicts (duplicate, already exists)
 */
public class ResourceConflictException extends BaseException {
    public ResourceConflictException(String message) {
        super(ErrorCode.RESOURCE_CONFLICT, message);
    }

    public ResourceConflictException(String resourceName, String field, Object value) {
        super(ErrorCode.RESOURCE_CONFLICT,
                String.format("%s with %s '%s' already exists", resourceName, field, value));
    }
}
