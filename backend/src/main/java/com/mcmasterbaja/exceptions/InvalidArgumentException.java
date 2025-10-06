package com.mcmasterbaja.exceptions;

import java.util.List;

public class InvalidArgumentException extends BajaException {

  private static final String ERROR_CODE = "INVALID_ARGUMENT";
  private static final String USER_MESSAGE_LIST = "One or more invalid arguments were passed.";
  private static final String USER_MESSAGE_SINGLE = "An invalid argument was passed.";

  private final List<String> errors;

  public InvalidArgumentException(List<String> errors) {
    super(String.join(", ", errors), ERROR_CODE, USER_MESSAGE_LIST);
    this.errors = errors;
  }

  public InvalidArgumentException(String error) {
    super(error, ERROR_CODE, USER_MESSAGE_SINGLE);
    this.errors = List.of(error);
  }

  public InvalidArgumentException(List<String> errors, Throwable cause) {
    super(String.join(", ", errors), cause, ERROR_CODE, USER_MESSAGE_LIST);
    this.errors = errors;
  }

  public InvalidArgumentException(String error, Throwable cause) {
    super(error, cause, ERROR_CODE, USER_MESSAGE_SINGLE);
    this.errors = List.of(error);
  }

  public List<String> getErrors() {
    return errors;
  }
}
