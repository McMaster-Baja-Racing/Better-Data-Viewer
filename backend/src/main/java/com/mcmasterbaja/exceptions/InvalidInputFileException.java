package com.mcmasterbaja.exceptions;

public class InvalidInputFileException extends StorageException {

  private static final String ERROR_CODE = "INVALID_INPUT_FILE";
  private static final String USER_MESSAGE = "An invalid input file was specified.";

  public InvalidInputFileException(String message) {
    super(message, ERROR_CODE, USER_MESSAGE);
  }

  public InvalidInputFileException(String message, Throwable cause) {
    super(message, cause, ERROR_CODE, USER_MESSAGE);
  }
}
