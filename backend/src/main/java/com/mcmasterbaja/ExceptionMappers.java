package com.mcmasterbaja;

import java.util.UUID;

import org.jboss.logging.Logger;
import org.jboss.resteasy.reactive.server.ServerExceptionMapper;

import com.mcmasterbaja.exceptions.AnalyzerException;
import com.mcmasterbaja.exceptions.BajaException;
import com.mcmasterbaja.exceptions.InvalidArgumentException;
import com.mcmasterbaja.exceptions.InvalidColumnException;
import com.mcmasterbaja.exceptions.InvalidHeaderException;
import com.mcmasterbaja.exceptions.InvalidInputFileException;
import com.mcmasterbaja.exceptions.InvalidOutputFileException;
import com.mcmasterbaja.exceptions.StorageException;
import com.mcmasterbaja.model.ErrorResponse;

import jakarta.inject.Inject;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

// Exceptions are mapped in priority of most specific first
public class ExceptionMappers {

  @Inject
  Logger logger;

  private Response mapBajaException(BajaException e) {
    String errorId = UUID.randomUUID().toString();
    logger.error("errorId[{}]", errorId, e);

    ErrorResponse errorResponse = e.toErrorResponse();

    return Response.status(500)
        .entity(errorResponse)
        .type(MediaType.APPLICATION_JSON)
        .build();
  }

  // Handles invalid arguments
  @ServerExceptionMapper(value = { InvalidArgumentException.class })
  public Response invalidArgument(RuntimeException e) {
    String errorId = UUID.randomUUID().toString();
    logger.error("errorId[{}]", errorId, e);

    ErrorResponse errorResponse = new ErrorResponse(
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

  // Handles invalid column exceptions
  @ServerExceptionMapper
  public Response invalidColumn(InvalidColumnException e) {
    String errorId = UUID.randomUUID().toString();
    logger.error("errorId[{}]", errorId, e);

    ErrorResponse errorResponse = new ErrorResponse(
        errorId,
        e.getStackTrace()[0].getClassName() + "." + e.getStackTrace()[0].getMethodName(),
        "An invalid column was specified.",
        "INVALID_COLUMN",
        e.getMessage());

    return Response.status(Response.Status.BAD_REQUEST)
        .entity(errorResponse)
        .type(MediaType.APPLICATION_JSON)
        .build();
  }

  // Handles invalid header exceptions
  @ServerExceptionMapper
  public Response mapInvalidHeaderException(InvalidHeaderException e) {
    return mapBajaException(e);
  }

  // Handles invalid input file exceptions
  @ServerExceptionMapper
  public Response mapInvalidInputFileException(InvalidInputFileException e) {
    return mapBajaException(e);
  }

  // Handles invalid output file exceptions
  @ServerExceptionMapper
  public Response mapInvalidOutputFileException(InvalidOutputFileException e) {
    return mapBajaException(e);
  }

  // Handles general storage exceptions
  @ServerExceptionMapper
  public Response mapStorageException(StorageException e) {
    return mapBajaException(e);
  }

  // Handles analyzer exceptions
  @ServerExceptionMapper
  public Response mapAnalyzerException(AnalyzerException e) {
    return mapBajaException(e);
  }

  @ServerExceptionMapper
  public Response mapUnsatisfiedLink(UnsatisfiedLinkError e) {
    String errorId = UUID.randomUUID().toString();
    logger.error("errorId[{}]", errorId, e);

    ErrorResponse errorResponse = new ErrorResponse(
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

    ErrorResponse errorResponse = new ErrorResponse(
        errorId,
        e.getStackTrace()[0].getClassName() + "." + e.getStackTrace()[0].getMethodName(),
        "Failed to link to parser library. Probably need to restart your backend, live reload"
            + " for the parser does not work.",
        "UNSATISFIED_LINK_ERROR",
        e.getMessage());

    return Response.status(500).entity(errorResponse).type(MediaType.APPLICATION_JSON).build();
  }
}
