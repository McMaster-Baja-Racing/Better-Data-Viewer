package com.mcmasterbaja.exceptions;

public class StorageException extends BajaException {

  public StorageException(String message) {
    super(message, "STORAGE_EXCEPTION", "An error occurred with storage.");
  }

  public StorageException(String message, Throwable cause) {
    super(message, cause, "STORAGE_EXCEPTION", "An error occurred with storage.");
  }

  // Add the constructor to handle errorCode and userMessage
  public StorageException(String message, String errorCode, String userMessage) {
    super(message, errorCode, userMessage);
  }
}
