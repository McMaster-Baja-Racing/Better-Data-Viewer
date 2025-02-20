package com.mcmasterbaja.exceptions;

import java.util.List;

public class InvalidArgumentException extends BajaException {
  private final List<String> errors;

  public InvalidArgumentException(List<String> errors) {
    super(
        String.join(", ", errors),
        "INVALID_ARGUMENT",
        "One or more invalid arguments were passed.");
    this.errors = errors;
  }

  public InvalidArgumentException(String error) {
    super(error, "INVALID_ARGUMENT", "An invalid argument was passed.");
    this.errors = List.of(error);
  }

  public InvalidArgumentException(List<String> errors, Throwable cause) {
    super(
        String.join(", ", errors),
        cause,
        "INVALID_ARGUMENT",
        "One or more invalid arguments were passed.");
    this.errors = errors;
  }

  public List<String> getErrors() {
    return errors;
  }
}
