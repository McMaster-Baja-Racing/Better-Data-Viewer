package com.mcmasterbaja.exceptions;

public class InvalidInputFileException extends StorageException {
    public InvalidInputFileException(String message) {
        super(message);
    }

    public InvalidInputFileException(String message, Throwable cause) {
        super(message, cause);
    }
}
