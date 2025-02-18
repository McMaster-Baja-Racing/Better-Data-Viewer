package com.mcmasterbaja.exceptions;

public class StorageException extends BajaException {

  private static final String DEFAULT_ERROR_CODE = "STORAGE_ERROR";
  private static final String DEFAULT_USER_MESSAGE = "Something went wrong. It's probably your fault.";

  public StorageException(String message) {
    super(message, DEFAULT_ERROR_CODE, DEFAULT_USER_MESSAGE);
  }

  public StorageException(String message, Throwable cause) {
    super(message, cause, DEFAULT_ERROR_CODE, DEFAULT_USER_MESSAGE);
  }

  public StorageException(String message, String userMessage) {
    super(message, DEFAULT_ERROR_CODE, userMessage);
  }

  public StorageException(String message, Throwable cause, String userMessage) {
    super(message, cause, DEFAULT_ERROR_CODE, userMessage);
  }
}
