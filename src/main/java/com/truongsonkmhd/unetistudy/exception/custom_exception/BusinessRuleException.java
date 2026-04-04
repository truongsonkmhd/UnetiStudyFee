package com.truongsonkmhd.unetistudy.exception.custom_exception;

import com.truongsonkmhd.unetistudy.exception.ErrorCode;

/**
 * Exception for business rule violations
 */
public class BusinessRuleException extends BaseException {
    public BusinessRuleException(String message) {
        super(ErrorCode.BUSINESS_RULE_VIOLATION, message);
    }
}
