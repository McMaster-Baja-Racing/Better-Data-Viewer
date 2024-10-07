package com.mcmasterbaja.model;

import com.fasterxml.jackson.annotation.JsonInclude;

import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import org.jboss.logging.Logger;

import java.time.Instant;
import java.util.UUID;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.ToString;

@Getter
@EqualsAndHashCode
@ToString
public class ErrorResponse {

  @JsonInclude(
      JsonInclude.Include.NON_NULL) // Removes fields that are null from appearing in the response
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

  // Factory to make Responses for use in the ExceptionMappers
  public static Response createErrorResponse(
      Logger logger, Throwable e, int status, String userMessage, String errorCode) {
    String errorId = UUID.randomUUID().toString();
    logger.error("errorId[{}]", errorId, e);

    StackTraceElement[] stackTraceElements = e.getStackTrace();

    // Avoid ArrayIndexOutOfBoundsException
    String className = stackTraceElements.length > 0 
            ? stackTraceElements[0].getClassName() 
            : "Unknown class";
    String methodName = stackTraceElements.length > 0 
            ? stackTraceElements[0].getMethodName() 
            : "Unknown method";

    ErrorResponse errorResponse =
        new ErrorResponse(
            errorId,
            className + "." + methodName,
            userMessage,
            errorCode,
            e.getMessage());

    return Response.status(status)
        .entity(errorResponse)
        .type(MediaType.APPLICATION_JSON)
        .build();
  }
  
}
