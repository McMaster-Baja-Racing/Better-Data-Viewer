package com.mcmasterbaja.exceptions;

public class DataProcessingException extends AnalyzerException{
    public DataProcessingException(String message) {
        super(message);
    }

    public DataProcessingException(String message, Throwable cause) {
        super(message, cause);
    }
}
