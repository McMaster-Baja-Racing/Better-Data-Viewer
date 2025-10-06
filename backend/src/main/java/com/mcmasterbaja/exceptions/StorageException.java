package com.mcmasterbaja.exceptions;

public class StorageException extends BajaException {

  private static final String DEFAULT_ERROR_CODE = "STORAGE_ERROR";
  private static final String DEFAULT_USER_MESSAGE =
      "Something went wrong. It's probably your fault.";

  // Constructor for generic StorageException (uses default error code)
  public StorageException(String message) {
    super(message, DEFAULT_ERROR_CODE, DEFAULT_USER_MESSAGE);
  }

  public StorageException(String message, Throwable cause) {
    super(message, cause, DEFAULT_ERROR_CODE, DEFAULT_USER_MESSAGE);
  }

  // Constructor for subclasses to define their own error code & message
  public StorageException(String message, String errorCode, String userMessage) {
    super(message, errorCode, userMessage);
  }

  public StorageException(String message, Throwable cause, String errorCode, String userMessage) {
    super(message, cause, errorCode, userMessage);
  }
}
