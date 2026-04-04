package com.truongsonkmhd.unetistudy.exception.custom_exception;

import com.truongsonkmhd.unetistudy.exception.ErrorCode;

/**
 * Exception for forbidden access
 */
public class ForbiddenException extends BaseException {
    public ForbiddenException(String message) {
        super(ErrorCode.FORBIDDEN, message);
    }

    public ForbiddenException() {
        super(ErrorCode.FORBIDDEN, "You don't have permission to access this resource");
    }
}
