package com.mcmasterbaja.exceptions;

public class SerialException extends RuntimeException {
  public SerialException(String msg) {
    super(msg);
  }

  public SerialException(String msg, Throwable cause) {
    super(msg, cause);
  }
}
