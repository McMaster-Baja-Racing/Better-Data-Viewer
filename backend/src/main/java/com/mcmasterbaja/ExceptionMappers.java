package com.mcmasterbaja;

import com.mcmasterbaja.exceptions.InvalidArgumentException;
import com.mcmasterbaja.exceptions.MalformedCsvException;
import com.mcmasterbaja.exceptions.StorageException;
import com.mcmasterbaja.model.ErrorResponse;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.UUID;
import org.jboss.logging.Logger;
import org.jboss.resteasy.reactive.server.ServerExceptionMapper;

// Exceptions are mapped in priority of most specific first
public class ExceptionMappers {

  @Inject Logger logger;

  // Handles invalid arguments
  @ServerExceptionMapper(value = {InvalidArgumentException.class, IllegalArgumentException.class})
  public Response invalidArgument(RuntimeException e) {
    String errorId = UUID.randomUUID().toString();
    logger.error("errorId[{}]", errorId, e);

    ErrorResponse errorResponse =
        new ErrorResponse(
            errorId,
            e.getStackTrace()[0].getClassName() + "." + e.getStackTrace()[0].getMethodName(),
            "An invalid argument was passed.",
            "INVALID_ARGUMENT",
            e.getMessage());

    return Response.status(Response.Status.BAD_REQUEST)
        .entity(errorResponse)
        .type(MediaType.APPLICATION_JSON)
        .build();
  }

  // Handles poor CSVs
  @ServerExceptionMapper
  public Response mapNotFoundException(MalformedCsvException e) {
    String errorId = UUID.randomUUID().toString();
    logger.error("errorId[{}]", errorId, e);

    ErrorResponse errorResponse =
        new ErrorResponse(
            errorId,
            e.getStackTrace()[14].getClassName() + "." + e.getStackTrace()[14].getMethodName(),
            "The CSV file `" + e.getFile() + "` is invalid. Please check or re-upload.",
            "MALFORMED_CSV",
            e.getMessage());

    return Response.status(422).entity(errorResponse).type(MediaType.APPLICATION_JSON).build();
  }

  // Handles general storage exceptions
  @ServerExceptionMapper
  public Response mapStorageException(StorageException e) {
    String errorId = UUID.randomUUID().toString();
    logger.error("errorId[{}]", errorId, e);

    ErrorResponse errorResponse =
        new ErrorResponse(
            errorId,
            e.getStackTrace()[0].getClassName() + "." + e.getStackTrace()[0].getMethodName(),
            "Something went wrong. It's probably your fault.",
            "STORAGE_EXCEPTION",
            e.getMessage());

    return Response.status(500).entity(errorResponse).type(MediaType.APPLICATION_JSON).build();
  }

  // TODO: Put these in the upload resource file, since they are specific to that
  @ServerExceptionMapper
  public Response mapUnsatisfiedLink(UnsatisfiedLinkError e) {
    String errorId = UUID.randomUUID().toString();
    logger.error("errorId[{}]", errorId, e);

    ErrorResponse errorResponse =
        new ErrorResponse(
            errorId,
            e.getStackTrace()[6].getClassName() + "." + e.getStackTrace()[6].getMethodName(),
            "Failed to link to parser library. Might need to restart the backend.",
            "UNSATISFIED_LINK_ERROR",
            e.getMessage());

    return Response.status(500).entity(errorResponse).type(MediaType.APPLICATION_JSON).build();
  }

  @ServerExceptionMapper
  public Response mapUnsatisfiedLink(NoClassDefFoundError e) {
    String errorId = UUID.randomUUID().toString();
    logger.error("errorId[{}]", errorId, e);

    ErrorResponse errorResponse =
        new ErrorResponse(
            errorId,
            e.getStackTrace()[0].getClassName() + "." + e.getStackTrace()[0].getMethodName(),
            "Failed to link to parser library. Probably need to restart your backend, live reload for the parser does not work.",
            "UNSATISFIED_LINK_ERROR",
            e.getMessage());

    return Response.status(500).entity(errorResponse).type(MediaType.APPLICATION_JSON).build();
  }
}
