package backend.API;

import org.apache.commons.math3.exception.NotStrictlyPositiveException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * This class extends ResponseEntityExceptionHandler to provide custom handling for specific
 * exceptions. It is annotated with @ControllerAdvice to make it applicable to all controllers in
 * the application.
 */
@ControllerAdvice
public class MasterExceptionHandler extends ResponseEntityExceptionHandler {

  /**
   * Handles ArrayIndexOutOfBoundsExceptions, which are frequently caused by faulty CSV files.
   *
   * @param ex the exception that was thrown
   * @param request the current web request
   * @return a ResponseEntity with an error message as the body and a CONFLICT status code
   */
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

  /**
   * Handles NumberFormatExceptions, NotStrictlyPositiveExceptions, and IndexOutOfBoundsExceptions,
   * which are often caused by issues with analyzer options.
   *
   * @param ex the exception that was thrown
   * @param request the current web request
   * @return a ResponseEntity with an error message and a CONFLICT status code
   */
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
