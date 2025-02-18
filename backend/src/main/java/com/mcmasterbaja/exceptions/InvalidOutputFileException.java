package com.mcmasterbaja.exceptions;

public class InvalidOutputFileException extends StorageException {
  private static final String USER_MESSAGE = "An invalid output file was specified.";

  public InvalidOutputFileException(String message) {
    super(message, USER_MESSAGE);
  }

  public InvalidOutputFileException(String message, Throwable cause) {
    super(message, cause, USER_MESSAGE);
  }
}
