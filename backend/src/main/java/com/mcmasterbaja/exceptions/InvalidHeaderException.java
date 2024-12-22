package com.mcmasterbaja.exceptions;

public class InvalidHeaderException extends StorageException {
  public InvalidHeaderException(String message) {
    super(message);
  }

  public InvalidHeaderException(String message, Throwable cause) {
    super(message, cause);
  }
}
