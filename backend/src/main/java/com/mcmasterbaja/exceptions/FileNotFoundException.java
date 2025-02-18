package com.mcmasterbaja.exceptions;

public class FileNotFoundException extends StorageException {
  private static final String USER_MESSAGE = "File not found.";

  public FileNotFoundException(String message) {
    super(message, USER_MESSAGE);
  }

  public FileNotFoundException(String message, Throwable cause) {
    super(message, cause, USER_MESSAGE);
  }
}
