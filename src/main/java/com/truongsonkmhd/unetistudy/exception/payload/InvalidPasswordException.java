package com.truongsonkmhd.unetistudy.exception.payload;

public class InvalidPasswordException extends RuntimeException {
    public InvalidPasswordException(String message) {
        super(message);
    }
}
