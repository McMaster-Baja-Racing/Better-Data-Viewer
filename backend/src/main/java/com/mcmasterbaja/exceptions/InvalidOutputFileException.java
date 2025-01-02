package com.mcmasterbaja.exceptions;

public class InvalidOutputFileException extends StorageException {
  public InvalidOutputFileException(String message) {
    super(message);
  }

  public InvalidOutputFileException(String message, Throwable cause) {
    super(message, cause);
  }
}
