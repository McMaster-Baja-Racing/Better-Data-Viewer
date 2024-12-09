package com.mcmasterbaja.exceptions;

public class InvalidOutputFileException extends AnalyzerException {
    public InvalidOutputFileException(String message) {
        super(message);
    }

    public InvalidOutputFileException(String message, Throwable cause) {
        super(message, cause);
    }
}