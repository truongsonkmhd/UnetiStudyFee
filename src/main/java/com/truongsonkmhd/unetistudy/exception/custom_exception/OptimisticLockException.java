package com.truongsonkmhd.unetistudy.exception.custom_exception;

import com.truongsonkmhd.unetistudy.exception.ErrorCode;

/**
 * Exception for optimistic locking failures
 */
public class OptimisticLockException extends BaseException {
    public OptimisticLockException() {
        super(ErrorCode.OPTIMISTIC_LOCK_ERROR,
                "The resource has been modified by another user. Please refresh and try again.");
    }

    public OptimisticLockException(String message) {
        super(ErrorCode.OPTIMISTIC_LOCK_ERROR, message);
    }
}
