package com.mcmasterbaja;

import com.mcmasterbaja.analyzer.Analyzer;
import com.mcmasterbaja.analyzer.AnalyzerFactory;
import com.mcmasterbaja.exceptions.InvalidArgumentException;
import com.mcmasterbaja.live.Serial;
import com.mcmasterbaja.model.AnalyzerParams;
import com.mcmasterbaja.model.MinMax;
import com.mcmasterbaja.services.FileMetadataService;
import com.mcmasterbaja.services.StorageService;
import jakarta.inject.Inject;
import jakarta.ws.rs.BeanParam;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.QueryParam;
import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.jboss.logging.Logger;
import org.jboss.resteasy.reactive.RestResponse;
import org.jboss.resteasy.reactive.RestResponse.ResponseBuilder;

@jakarta.ws.rs.Path("/")
public class FileAnalyzeResource {

  @Inject Logger logger;
  @Inject StorageService storageService;
  @Inject FileMetadataService fileMetadataService;
  @Inject Analyzer analyzer;
  @Inject AnalyzerParams analyzerParams;

  // TODO: Convert to using POST body rather than path variables
  @POST
  @jakarta.ws.rs.Path("analyze")
  public RestResponse<File> runAnalyzer(@BeanParam AnalyzerParams params) {
    logger.info("Running analyzer with params: " + params.toString());

    if (!params.getErrors().isEmpty()) {
      throw new InvalidArgumentException(params.getErrors());
    }

    // Update input files with rootLocation/csv and generate output file names
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
          throw new RuntimeException("Error running analyzer");
        }
      }
    }

    Path targetPath = Paths.get(params.getOutputFiles()[0]);
    File file = storageService.load(targetPath).toFile();
    Path relativePath = storageService.load(Paths.get("csv")).relativize(targetPath);

    return ResponseBuilder.ok(file, "application/octet-stream")
        .header("Content-Disposition", "attachment; filename=\"" + relativePath.toString() + "\"")
        .header("Access-Control-Expose-Headers", "Content-Disposition")
        .build();
  }

  @GET
  @jakarta.ws.rs.Path("minMax/{filekey}")
  public MinMax getMinMax(
      @PathParam("filekey") String filekey, @QueryParam("column") String column) {
    logger.info("Getting min and max for file: " + filekey);

    String typeFolder = fileMetadataService.getTypeFolder(Paths.get(filekey));
    Path targetPath = storageService.load(Paths.get(typeFolder)).resolve(filekey);
    MinMax minMax = fileMetadataService.getMinMax(targetPath, column);

    return minMax;
  }

  @PATCH
  @jakarta.ws.rs.Path("togglelive")
  public Boolean toggleLive() {
    logger.info("Toggling live data to: " + Serial.exit);
    Boolean exit = Serial.exit;

    if (!Serial.exit) {
      Serial.exit = true;
    } else {
      new Thread(
              () -> {
                Serial.readLive();
              })
          .start();
    }

    return exit;
  }
}
