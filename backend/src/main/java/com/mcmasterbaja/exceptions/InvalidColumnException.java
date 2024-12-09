package com.mcmasterbaja.exceptions;

public class InvalidColumnException extends AnalyzerException {
    public InvalidColumnException(String message) {
        super(message);
    }

    public InvalidColumnException(String message, Throwable cause) {
        super(message, cause);
    }
}
