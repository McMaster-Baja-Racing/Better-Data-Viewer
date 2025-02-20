package com.mcmasterbaja.exceptions;

public class InvalidColumnException extends StorageException {

  private static final String ERROR_CODE = "INVALID_COLUMN";
  private static final String USER_MESSAGE = "An invalid column was specified.";

  public InvalidColumnException(String message) {
    super(message, ERROR_CODE, USER_MESSAGE);
  }

  public InvalidColumnException(String message, Throwable cause) {
    super(message, cause, ERROR_CODE, USER_MESSAGE);
  }
}
