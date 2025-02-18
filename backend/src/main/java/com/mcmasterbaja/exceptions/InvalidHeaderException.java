package com.mcmasterbaja.exceptions;

public class InvalidHeaderException extends StorageException {
  private static final String USER_MESSAGE = "Failed to read headers from input file.";

  public InvalidHeaderException(String message) {
    super(message, USER_MESSAGE);
  }

  public InvalidHeaderException(String message, Throwable cause) {
    super(message, cause, USER_MESSAGE);
  }
}
