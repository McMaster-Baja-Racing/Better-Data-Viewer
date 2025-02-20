package com.mcmasterbaja.exceptions;

public class FileNotFoundException extends StorageException {

  private static final String ERROR_CODE = "FILE_NOT_FOUND";
  private static final String USER_MESSAGE = "File not found.";

  public FileNotFoundException(String message) {
    super(message, ERROR_CODE, USER_MESSAGE);
  }

  public FileNotFoundException(String message, Throwable cause) {
    super(message, cause, ERROR_CODE, USER_MESSAGE);
  }
}
