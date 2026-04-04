package com.truongsonkmhd.unetistudy.dto.a_common;

import com.truongsonkmhd.unetistudy.constant.AppConstant;
import org.springframework.http.HttpStatus;
import org.springframework.validation.ObjectError;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

public class ErrorResponseMessage extends ResponseMessage {

    private static final boolean IS_THROW = true;

    // custom \\
    public static ResponseMessage CreateFail(){
        if(IS_THROW){
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, AppConstant.ResponseConstant.MessageConstant.ErrorMessage.CREATE_FAIL);
        }
        return ResponseMessage.builder()
            .status(AppConstant.ResponseConstant.FAILED)
            .statusCode(AppConstant.ResponseConstant.StatusCode.SYSTEM_ERROR)
            .message(AppConstant.ResponseConstant.MessageConstant.ErrorMessage.CREATE_FAIL)
            .build();
    };

    public static ResponseMessage UpdateFail(){
        if(IS_THROW){
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, AppConstant.ResponseConstant.MessageConstant.ErrorMessage.UPDATE_FAIL);
        }
        return ResponseMessage.builder()
            .status(AppConstant.ResponseConstant.FAILED)
            .statusCode(AppConstant.ResponseConstant.StatusCode.SYSTEM_ERROR)
            .message(AppConstant.ResponseConstant.MessageConstant.ErrorMessage.UPDATE_FAIL)
            .build();
    };

    public static ResponseMessage DeleteFail(){
        if(IS_THROW){
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, AppConstant.ResponseConstant.MessageConstant.ErrorMessage.DELETE_FAIL);
        }
        return ResponseMessage.builder()
            .status(AppConstant.ResponseConstant.FAILED)
            .statusCode(AppConstant.ResponseConstant.StatusCode.SYSTEM_ERROR)
            .message(AppConstant.ResponseConstant.MessageConstant.ErrorMessage.DELETE_FAIL)
            .build();
    };


    public static ResponseMessage LoadDataFail(){
        if(IS_THROW){
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, AppConstant.ResponseConstant.MessageConstant.ErrorMessage.LOAD_FAIL);
        }
        return ResponseMessage.builder()
            .status(AppConstant.ResponseConstant.FAILED)
            .statusCode(AppConstant.ResponseConstant.StatusCode.SYSTEM_ERROR)
            .message(AppConstant.ResponseConstant.MessageConstant.ErrorMessage.LOAD_FAIL)
            .build();
    };

    public static ResponseMessage ItemNotFound(){
        if(IS_THROW){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, AppConstant.ResponseConstant.MessageConstant.ErrorMessage.DID_NOT_EXIST);
        }
        return ResponseMessage.builder()
            .status(AppConstant.ResponseConstant.FAILED)
            .statusCode(AppConstant.ResponseConstant.StatusCode.NOTFOUND_ERROR)
            .message(AppConstant.ResponseConstant.MessageConstant.ErrorMessage.DID_NOT_EXIST)
            .build();
    };

    public static ResponseMessage BadRequest(String message){
        if(IS_THROW){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
        return ResponseMessage.builder()
            .status(AppConstant.ResponseConstant.FAILED)
            .statusCode(AppConstant.ResponseConstant.StatusCode.BAD_REQUEST)
            .message(message)
            .build();
    }

    public static ResponseMessage ValidationFail(List<ObjectError> errors) {
        if (IS_THROW) {
            String errorMessage = errors.stream()
                .map(ObjectError::getDefaultMessage)
                .reduce((message1, message2) -> message1 + "; " + message2)
                .orElse("Validation failed");

            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, errorMessage);
        }
        return ResponseMessage.builder()
            .status(AppConstant.ResponseConstant.FAILED)
            .statusCode(AppConstant.ResponseConstant.StatusCode.BAD_REQUEST)
            .message(errors.stream()
                .map(ObjectError::getDefaultMessage)
                .reduce((message1, message2) -> message1 + "; " + message2)
                .orElse("Validation failed"))
            .build();
    }


}
