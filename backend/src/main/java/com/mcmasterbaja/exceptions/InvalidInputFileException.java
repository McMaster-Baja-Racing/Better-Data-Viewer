package com.mcmasterbaja.exceptions;

public class InvalidInputFileException extends AnalyzerException {
    public InvalidInputFileException(String message) {
        super(message);
    }

    public InvalidInputFileException(String message, Throwable cause) {
        super(message, cause);
    }
}
