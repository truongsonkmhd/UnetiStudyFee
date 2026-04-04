package com.truongsonkmhd.unetistudy.exception.custom_exception;

import com.truongsonkmhd.unetistudy.exception.ErrorCode;

/**
 * Exception for resource not found scenarios
 */
public class ResourceNotFoundException extends BaseException {
    public ResourceNotFoundException(String message) {
        super(ErrorCode.RESOURCE_NOT_FOUND, message);
    }

    public ResourceNotFoundException(String resourceName, Object id) {
        super(ErrorCode.RESOURCE_NOT_FOUND,
                String.format("%s not found with id: %s", resourceName, id));
    }
}
