package com.mcmasterbaja.exceptions;

public class InvalidOutputFileException extends StorageException {

  private static final String ERROR_CODE = "INVALID_OUTPUT_FILE";
  private static final String USER_MESSAGE = "An invalid output file was specified.";

  public InvalidOutputFileException(String message) {
    super(message, ERROR_CODE, USER_MESSAGE);
  }

  public InvalidOutputFileException(String message, Throwable cause) {
    super(message, cause, ERROR_CODE, USER_MESSAGE);
  }
}
