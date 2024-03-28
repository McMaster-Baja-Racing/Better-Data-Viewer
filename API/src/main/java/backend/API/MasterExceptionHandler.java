package backend.API;

import org.apache.commons.math3.exception.NotStrictlyPositiveException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

// This class is used to handle exceptions thrown by the API.
// @ControllerAdvice tells the controller how to handle exceptions.
@ControllerAdvice
public class MasterExceptionHandler extends ResponseEntityExceptionHandler {

  // Method to handle frequent errors on CSV files.
  @ExceptionHandler(value = {ArrayIndexOutOfBoundsException.class})
  protected ResponseEntity<Object> handleBadCsv(RuntimeException ex, WebRequest request) {
    String bodyOfResponse =
        "Error: "
            + ex.getClass().getCanonicalName()
            + " → "
            + ex.getMessage()
            + ".\nMessage: This is most likely caused by a faulty CSV file. "
            + "Make sure to check for any empty cells, trailing whitespaces or \\n characters.";
    HttpHeaders responseHeaders = new HttpHeaders();
    responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
    responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");
    return handleExceptionInternal(
        ex, bodyOfResponse, responseHeaders, HttpStatus.CONFLICT, request);
  }

  // Method to handle issues with analyzer options.
  @ExceptionHandler(
      value = {
        NumberFormatException.class,
        NotStrictlyPositiveException.class,
        IndexOutOfBoundsException.class
      })
  protected ResponseEntity<Object> handleBadAnalyzerOption(
      RuntimeException ex, WebRequest request) {
    String bodyOfResponse =
        "Error: "
            + ex.getClass().getCanonicalName()
            + " → "
            + ex.getMessage()
            + ".\nMessage: Make sure to check your analyzer "
            + "options before submitting your request.";
    HttpHeaders responseHeaders = new HttpHeaders();
    responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
    responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");
    return handleExceptionInternal(
        ex, bodyOfResponse, responseHeaders, HttpStatus.CONFLICT, request);
  }
}
