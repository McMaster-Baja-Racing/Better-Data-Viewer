package com.mcmasterbaja;

import com.mcmasterbaja.analyzer.Analyzer;
import com.mcmasterbaja.analyzer.AnalyzerFactory;
import com.mcmasterbaja.annotations.OnAnalyzerException;
import com.mcmasterbaja.exceptions.InvalidArgumentException;
import com.mcmasterbaja.live.Serial;
import com.mcmasterbaja.model.AnalyzerParams;
import com.mcmasterbaja.model.AnalyzerType;
import com.mcmasterbaja.model.MinMax;
import com.mcmasterbaja.model.SmartAnalyzerParams;
import com.mcmasterbaja.services.FileMetadataService;
import com.mcmasterbaja.services.SmartAnalyzerService;
import com.mcmasterbaja.services.StorageService;
import jakarta.inject.Inject;
import jakarta.ws.rs.BeanParam;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PathParam;
import com.mcmasterbaja.exceptions.SerialException;
import java.io.IOException;
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
  @Inject AnalyzerFactory analyzerFactory;
  @Inject SmartAnalyzerService smartAnalyzerService;

  // TODO: Convert to using POST body rather than path variables
  @POST
  @jakarta.ws.rs.Path("analyze")
  @OnAnalyzerException
  public RestResponse<File> runAnalyzer(@BeanParam AnalyzerParams params) {
    logger.info("Running analyzer with params: " + params.toString());

    if (!params.getErrors().isEmpty()) {
      throw new InvalidArgumentException(params.getErrors());
    }

    // Update input files with rootLocation/csv
    params.updateInputFiles(storageService.getRootLocation());
    params.generateOutputFileNames();
    // Default to returning the input file, will be overwritten if an analyzer is found later
    Path targetPath = Path.of(params.getInputFiles()[0]);

    if (params.getType() != null) {
      Analyzer analyzer = analyzerFactory.getAnalyzer(params.getType());
      analyzer.analyze(params);
      targetPath = Path.of(analyzer.getOutputFilename());
    }

    File file = storageService.load(targetPath).toFile();
    Path relativePath = storageService.load(Paths.get("csv")).relativize(targetPath);

    return ResponseBuilder.ok(file, "application/octet-stream")
        .header("Content-Disposition", "attachment; filename=\"" + relativePath.toString() + "\"")
        .header("Access-Control-Expose-Headers", "Content-Disposition")
        .build();
  }

  @POST
  @jakarta.ws.rs.Path("analyze/smart")
  @OnAnalyzerException
  public RestResponse<File> runSmartAnalyzer(@BeanParam SmartAnalyzerParams smartParams) {
    logger.info("Running smart analyzer with params: " + smartParams.toString());

    if (!smartParams.getErrors().isEmpty()) {
      throw new InvalidArgumentException(smartParams.getErrors());
    }

    Path targetPath;

    if (smartAnalyzerService.needsPreprocessing(smartParams)) {
      // PREPROCESSING FLOW: Run INTERPOLATER_PRO first, then user's analyzer
      logger.info("Preprocessing needed - running two-stage analysis");

      // Stage 1: Run INTERPOLATER_PRO preprocessing
      AnalyzerParams preprocessParams = smartAnalyzerService.createPreprocessingParams(smartParams);
      preprocessParams.updateInputFiles(storageService.getRootLocation());
      preprocessParams.generateOutputFileNames();

      Analyzer preprocessAnalyzer = analyzerFactory.getAnalyzer(AnalyzerType.INTERPOLATER_PRO);
      preprocessAnalyzer.analyze(preprocessParams);
      String preprocessedFile = preprocessAnalyzer.getOutputFilename();

      // Stage 2: Run user's analyzer on preprocessed data (if specified)
      if (smartParams.getType() != null) {
        logger.info("Running user's analyzer: " + smartParams.getType());
        AnalyzerParams userParams =
            smartAnalyzerService.createUserAnalyzerParams(smartParams, preprocessedFile);
        userParams.updateInputFiles(storageService.getRootLocation());
        userParams.generateOutputFileNames();

        Analyzer userAnalyzer = analyzerFactory.getAnalyzer(smartParams.getType());
        userAnalyzer.analyze(userParams);
        targetPath = Path.of(userAnalyzer.getOutputFilename());
      } else {
        // No user analyzer specified, return preprocessed file
        targetPath = Path.of(preprocessedFile);
      }

    } else {
      // DIRECT FLOW: No preprocessing needed, run user's analyzer directly
      logger.info("No preprocessing needed - running analyzer directly");

      String inputFile = smartAnalyzerService.getDirectInputFile(smartParams);

      if (smartParams.getType() != null) {
        AnalyzerParams params =
            smartAnalyzerService.createUserAnalyzerParams(smartParams, inputFile);
        params.updateInputFiles(storageService.getRootLocation());
        params.generateOutputFileNames();

        Analyzer analyzer = analyzerFactory.getAnalyzer(smartParams.getType());
        analyzer.analyze(params);
        targetPath = Path.of(analyzer.getOutputFilename());
      } else {
        // No analyzer specified, return input file directly
        targetPath = storageService.getRootLocation().resolve("csv").resolve(inputFile);
      }
    }

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
  public Boolean toggleLive() throws IOException {
    Serial serial = new Serial();
    logger.info("Toggling live data to: " + serial.exit);
    Boolean exit = serial.exit;

    if (!serial.exit) {
      serial.exit = true;
    } else {
      new Thread(() -> {
          try {
            serial.readLive();
          } catch (IOException e) {
            throw new SerialException("Failed to read serial data");
          }
        }).start();
    }

    return exit;
  }
}
