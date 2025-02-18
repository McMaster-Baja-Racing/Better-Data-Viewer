package com.mcmasterbaja.exceptions;

public class InvalidColumnException extends StorageException {
  private static final String USER_MESSAGE = "An invalid column was specified.";

  public InvalidColumnException(String message) {
    super(message, USER_MESSAGE);
  }

  public InvalidColumnException(String message, Throwable cause) {
    super(message, cause, USER_MESSAGE);
  }
}
