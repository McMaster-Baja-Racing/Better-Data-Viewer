package com.mcmasterbaja;

import com.mcmasterbaja.exceptions.InvalidArgumentException;
import com.mcmasterbaja.exceptions.MalformedCsvException;
import com.mcmasterbaja.exceptions.StorageException;
import com.mcmasterbaja.model.ErrorResponse;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;
import org.jboss.resteasy.reactive.server.ServerExceptionMapper;

// Exceptions are mapped in priority of most specific first
public class ExceptionMappers {

  @Inject Logger logger;

  // Handles invalid arguments
  @ServerExceptionMapper(value = {InvalidArgumentException.class, IllegalArgumentException.class})
  public Response invalidArgument(RuntimeException e) {
    return ErrorResponse.createErrorResponse(
        logger,
        e,
        Response.Status.BAD_REQUEST.getStatusCode(),
        "An invalid argument was passed.",
        "INVALID_ARGUMENT");
  }

  // Handles poor CSVs
  @ServerExceptionMapper
  public Response mapNotFoundException(MalformedCsvException e) {
    return ErrorResponse.createErrorResponse(
        logger,
        e,
        422,
        "The CSV file `" + e.getFile() + "` is invalid. Please check or re-upload.",
        "MALFORMED_CSV");
  }

  // Handles general storage exceptions
  @ServerExceptionMapper
  public Response mapStorageException(StorageException e) {
    return ErrorResponse.createErrorResponse(
        logger,
        e,
        500,
        "Something went wrong. It's probably your fault.",
        "STORAGE_EXCEPTION");
  }

  // TODO: Put these in the upload resource file, since they are specific to that
  @ServerExceptionMapper
  public Response mapUnsatisfiedLink(UnsatisfiedLinkError e) {
    return ErrorResponse.createErrorResponse(
      logger,
      e,
      500,
      "Failed to link to parser library. Might need to restart the backend.",
      "UNSATISFIED_LINK_ERROR");
  }

  @ServerExceptionMapper
  public Response mapUnsatisfiedLink(NoClassDefFoundError e) {
    return ErrorResponse.createErrorResponse(
      logger,
      e,
      500,
      "Failed to link to parser library. Probably need to restart your backend, live reload"
          + " for the parser does not work.",
      "UNSATISFIED_LINK_ERROR");
  }
}
