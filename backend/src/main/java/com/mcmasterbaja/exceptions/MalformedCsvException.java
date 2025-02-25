package com.mcmasterbaja.exceptions;

import lombok.Getter;

@Getter
public class MalformedCsvException extends StorageException {

  private static final String ERROR_CODE = "MALFORMED_CSV";
  private static final String USER_MESSAGE = "The given CSV is malformed.";
  private String file;

  public MalformedCsvException(String message) {
    super(message, ERROR_CODE, USER_MESSAGE);
  }

  public MalformedCsvException(String message, Throwable cause) {
    super(message, cause, ERROR_CODE, USER_MESSAGE);
  }

  public MalformedCsvException(String message, String file, Throwable cause) {
    super(message, cause, ERROR_CODE, USER_MESSAGE);
    this.file = file;
  }
}
