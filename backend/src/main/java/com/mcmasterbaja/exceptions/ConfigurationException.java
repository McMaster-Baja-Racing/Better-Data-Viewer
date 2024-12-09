package com.mcmasterbaja.exceptions;

public class ConfigurationException extends AnalyzerException{
    public ConfigurationException(String message) {
        super(message);
    }

    public ConfigurationException(String message, Throwable cause) {
        super(message, cause);
    }
}
