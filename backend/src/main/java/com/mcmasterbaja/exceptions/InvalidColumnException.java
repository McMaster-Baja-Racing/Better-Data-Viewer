package com.mcmasterbaja.exceptions;

public class InvalidColumnException extends StorageException {
  public InvalidColumnException(String message) {
    super(message);
  }

  public InvalidColumnException(String message, Throwable cause) {
    super(message, cause);
  }
}
