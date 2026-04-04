package com.truongsonkmhd.unetistudy.dto.a_common;

public interface IResponseMessage {
    boolean isStatus();

    int getStatusCode();

    String getMessage();

    Object getData();
}
