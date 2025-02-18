package com.mcmasterbaja.exceptions;

import java.util.UUID;

import com.mcmasterbaja.model.ErrorResponse;

public abstract class BajaException extends RuntimeException {
    private final String errorCode;
    private final String userMessage;

    // message
    public BajaException(String message, String errorCode, String userMessage) {
        super(message);
        this.errorCode = errorCode;
        this.userMessage = userMessage;
    }

    // message + cause
    public BajaException(String message, Throwable cause, String errorCode, String userMessage) {
        super(message, cause);
        this.errorCode = errorCode;
        this.userMessage = userMessage;
    }

    public ErrorResponse toErrorResponse() {
        String errorId = UUID.randomUUID().toString();
        StackTraceElement origin = getStackTrace()[0];

        return new ErrorResponse(
                errorId,
                origin.getClassName() + "." + origin.getMethodName(),
                userMessage,
                errorCode,
                getMessage());
    }
}
