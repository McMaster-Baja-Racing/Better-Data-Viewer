package com.mcmasterbaja.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.ToString;

@Getter
@EqualsAndHashCode
@ToString
public class ErrorResponse {

  @JsonInclude(JsonInclude.Include.NON_NULL)
  private String errorId;

  private String path;
  private String message;
  private String errorType;
  private Instant timestamp;
  private Object details;

  public ErrorResponse(
      String errorId, String path, String message, String errorType, Object details) {
    this.errorId = errorId;
    this.path = path;
    this.message = message;
    this.errorType = errorType;
    this.timestamp = Instant.now();
    this.path = path;
    this.details = details;
  }
}
