package com.mcmasterbaja.exceptions;

public class ResourceInitException extends AnalyzerException {
    public ResourceInitException(String message) {
        super(message);
    }

    public ResourceInitException(String message, Throwable cause) {
        super(message, cause);
    }
}
