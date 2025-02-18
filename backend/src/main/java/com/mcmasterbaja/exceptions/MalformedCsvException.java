package com.mcmasterbaja.exceptions;

import lombok.Getter;

@Getter
public class MalformedCsvException extends StorageException {
  private String file;

  public MalformedCsvException(String message) {
    super(message);
  }

  public MalformedCsvException(String message, Throwable cause) {
    super(message, cause);
  }

  public MalformedCsvException(String message, String file, Throwable cause) {
    super(message, cause);
    this.file = file;
  }
}