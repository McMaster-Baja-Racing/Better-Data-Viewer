package com.mcmasterbaja;

import com.mcmasterbaja.exceptions.BajaException;
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

  private Response mapBajaException(BajaException e) {
    String errorId = UUID.randomUUID().toString();
	@@ -27,13 +28,12 @@ private Response mapSystemError(Throwable e, String errorCode, String message) {
    String errorId = UUID.randomUUID().toString();
    logger.error("errorId[{}]", errorId, e);

    ErrorResponse errorResponse =
        new ErrorResponse(
            errorId,
            e.getStackTrace()[0].getClassName() + "." + e.getStackTrace()[0].getMethodName(),
            message,
            errorCode,
            e.getMessage());

    return Response.status(500).entity(errorResponse).type(MediaType.APPLICATION_JSON).build();
  }

  @ServerExceptionMapper
  public Response mapBajaExceptionHandler(BajaException e) {
    return mapBajaException(e);
  }

  @ServerExceptionMapper
  public Response mapUnsatisfiedLink(UnsatisfiedLinkError e) {
    return mapSystemError(
        e,
        "UNSATISFIED_LINK_ERROR",
        "Failed to link to parser library. Might need to restart the backend.");
  }

  @ServerExceptionMapper
  public Response mapUnsatisfiedLink(NoClassDefFoundError e) {
    return mapSystemError(
        e,
        "UNSATISFIED_LINK_ERROR",
        "Failed to link to parser library. Probably need to restart your backend, "
            + "live reload for the parser does not work.");
  }
}
