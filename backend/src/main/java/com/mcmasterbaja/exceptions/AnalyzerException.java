package com.mcmasterbaja.exceptions;

public class AnalyzerException extends BajaException {

  private static final String DEFAULT_ERROR_CODE = "ANALYZER_ERROR";
  private static final String DEFAULT_USER_MESSAGE = "An error occurred with the analyzer.";

  public AnalyzerException(String message) {
    super(message, DEFAULT_ERROR_CODE, DEFAULT_USER_MESSAGE);
  }

  public AnalyzerException(String message, Throwable cause) {
    super(message, cause, DEFAULT_ERROR_CODE, DEFAULT_USER_MESSAGE);
  }

  public AnalyzerException(String message, String userMessage) {
    super(message, DEFAULT_ERROR_CODE, userMessage);
  }

  public AnalyzerException(String message, Throwable cause, String userMessage) {
    super(message, cause, DEFAULT_ERROR_CODE, userMessage);
  }
}
