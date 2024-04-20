package com.mcmasterbaja;

import com.mcmasterbaja.analyzer.Analyzer;
import com.mcmasterbaja.analyzer.AnalyzerFactory;
import com.mcmasterbaja.live.Serial;
import com.mcmasterbaja.model.AnalyzerParams;
import com.mcmasterbaja.storage.FileMetadataService;
import com.mcmasterbaja.storage.StorageService;
import jakarta.inject.Inject;
import jakarta.ws.rs.BeanParam;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Response;
import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.jboss.logging.Logger;

@jakarta.ws.rs.Path("/")
public class FileAnalyzeResource {

  @Inject Logger logger;
  @Inject StorageService storageService;
  @Inject FileMetadataService fileMetadataService;

  @GET
  @jakarta.ws.rs.Path("analyze")
  public Response runAnalyzer(@BeanParam AnalyzerParams params) {
    logger.info("Running analyzer with params: " + params.toString());

    if (!params.isValid()) {
      logger.error("Invalid parameters");
      return Response.status(Response.Status.BAD_REQUEST).entity("Invalid parameters").build();
    }
    // TODO: Why is this required? Should be able to be removed and automated elsewhere
    for (int i = 0; i < params.getInputFiles().length; i++) {
      params.getInputFiles()[i] = "csv/" + params.getInputFiles()[i];
    }

    // Update input files with root location and generate output file names
    params.updateInputFiles(storageService.getRootLocation());
    params.generateOutputFileNames();

    // TODO: Can't pass in null to createAnalyzer, this if statement feels redundant
    if (params.getType() != null) {
      Analyzer analyzer = AnalyzerFactory.createAnalyzer(params);
      if (analyzer != null) {
        try {
          analyzer.analyze();
        } catch (Exception e) {
          logger.error("Error running analyzer", e);
          return Response.serverError().entity("Error running analyzer").build();
        }
      }
    }

    Path targetPath = Paths.get(params.getOutputFiles()[0]);
    File file = storageService.load(targetPath).toFile();

    return Response.ok(file, "application/octet-stream")
        .header("Content-Disposition", "attachment; filename=\"" + file.getName() + "\"")
        .header("Access-Control-Expose-Headers", "Content-Disposition")
        .build();
  }

  @GET
  @jakarta.ws.rs.Path("minMax/{filenkey}")
  public Response getMinMax(
      @PathParam("filekey") String filekey, @QueryParam("column") String column) {
    logger.info("Getting min and max for file: " + filekey);

    Path targetPath = storageService.getRootLocation().resolve(filekey);
    Double[] minMax = fileMetadataService.getMinMax(targetPath, column);

    if (minMax == null) {
      return Response.status(Response.Status.BAD_REQUEST).entity("Invalid column").build();
    }
    return Response.ok(minMax).build();
  }

  @GET
  @jakarta.ws.rs.Path("togglelive")
  public Response toggleLive() {
    logger.info("Toggling live data to: " + Serial.exit);

    if (!Serial.exit) {
      Serial.exit = true;
    } else {
      new Thread(
              () -> {
                Serial.readLive();
              })
          .start();
    }

    return Response.ok("Live data toggled to " + Serial.exit).build();
  }
}
