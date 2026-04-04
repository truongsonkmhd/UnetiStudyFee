package com.truongsonkmhd.unetistudy.exception.custom_exception;

import com.truongsonkmhd.unetistudy.exception.ErrorCode;

/**
 * Exception for invalid data
 */
public class InvalidDataException extends BaseException {
    public InvalidDataException(String message) {
        super(ErrorCode.INVALID_DATA, message);
    }

    public InvalidDataException(String fieldName, Object value) {
        super(ErrorCode.INVALID_DATA,
                String.format("Invalid value '%s' for field '%s'", value, fieldName));
    }
}
