package com.mcmasterbaja.storage.exceptions;

import java.util.List;

import lombok.Getter;

@Getter
public class InvalidArgumentException extends RuntimeException {
    private final List<String> errors;

    public InvalidArgumentException(List<String> errors) {
        this.errors = errors;
    }

    public InvalidArgumentException(String error) {
        this.errors = List.of(error);
    }

    public InvalidArgumentException(List<String> errors, Throwable cause) {
        super(cause);
        this.errors = errors;
    }
}
