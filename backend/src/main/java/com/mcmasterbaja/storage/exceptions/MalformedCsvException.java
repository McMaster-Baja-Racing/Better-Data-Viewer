package com.mcmasterbaja.storage.exceptions;

public class MalformedCsvException extends MetadataException {

    public MalformedCsvException(String message) {
        super(message);
    }
    
    public MalformedCsvException(String message, Throwable cause) {
        super(message, cause);
    }
    
}
