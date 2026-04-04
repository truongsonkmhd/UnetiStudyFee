package com.truongsonkmhd.unetistudy.dto.a_common;

import com.truongsonkmhd.unetistudy.constant.AppConstant;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class ResponseMessage implements IResponseMessage {

    @Builder.Default
    boolean status = true;

    @Builder.Default
    int statusCode = 200;

    @Builder.Default
    String message = "";

    Object data;

    @Override
    public boolean isStatus() {
        return status;
    }

    // Factory methods - Centralized from SuccessResponseMessage

    public static ResponseMessage ok(Object data) {
        return ResponseMessage.builder()
                .status(AppConstant.ResponseConstant.SUCCESS)
                .statusCode(AppConstant.ResponseConstant.StatusCode.SUCCESS)
                .message(AppConstant.ResponseConstant.MessageConstant.SuccessMessage.LOADED)
                .data(data)
                .build();
    }

    public static ResponseMessage created(Object data) {
        return ResponseMessage.builder()
                .status(AppConstant.ResponseConstant.SUCCESS)
                .statusCode(AppConstant.ResponseConstant.StatusCode.SUCCESS)
                .message(AppConstant.ResponseConstant.MessageConstant.SuccessMessage.CREATED)
                .data(data)
                .build();
    }

    public static ResponseMessage updated(Object data) {
        return ResponseMessage.builder()
                .status(AppConstant.ResponseConstant.SUCCESS)
                .statusCode(AppConstant.ResponseConstant.StatusCode.SUCCESS)
                .message(AppConstant.ResponseConstant.MessageConstant.SuccessMessage.UPDATED)
                .data(data)
                .build();
    }

    public static ResponseMessage deleted(Object data) {
        return ResponseMessage.builder()
                .status(AppConstant.ResponseConstant.SUCCESS)
                .statusCode(AppConstant.ResponseConstant.StatusCode.SUCCESS)
                .message(AppConstant.ResponseConstant.MessageConstant.SuccessMessage.DELETED)
                .data(data)
                .build();
    }

    public static ResponseMessage success(String message, Object data) {
        return ResponseMessage.builder()
                .status(AppConstant.ResponseConstant.SUCCESS)
                .statusCode(AppConstant.ResponseConstant.StatusCode.SUCCESS)
                .message(message)
                .data(data)
                .build();
    }

    // Aliases for backward compatibility - mapped to new standards

    public static ResponseMessage LoadedSuccess(Object... data) {
        return ok(data.length == 1 ? data[0] : data);
    }

    public static ResponseMessage CreatedSuccess(Object... data) {
        return created(data.length == 1 ? data[0] : data);
    }

    public static ResponseMessage UpdatedSuccess(Object... data) {
        return updated(data.length == 1 ? data[0] : data);
    }

    public static ResponseMessage DeletedSuccess(Object... data) {
        return deleted(data.length == 1 ? data[0] : data);
    }

    public static ResponseMessage ProcessSuccess(Object... data) {
        return ResponseMessage.builder()
                .status(AppConstant.ResponseConstant.SUCCESS)
                .statusCode(AppConstant.ResponseConstant.StatusCode.SUCCESS)
                .message(AppConstant.ResponseConstant.MessageConstant.SuccessMessage.PROCESS)
                .data(data.length == 1 ? data[0] : data)
                .build();
    }

    public static ResponseMessage ProcessSuccessAndMessage(String message, Object... data) {
        return success(message, data.length == 1 ? data[0] : data);
    }
}
