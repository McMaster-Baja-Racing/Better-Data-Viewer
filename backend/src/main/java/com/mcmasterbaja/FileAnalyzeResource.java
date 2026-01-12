package com.mcmasterbaja;

import com.mcmasterbaja.analyzer.Analyzer;
import com.mcmasterbaja.analyzer.AnalyzerFactory;
import com.mcmasterbaja.annotations.OnAnalyzerException;
import com.mcmasterbaja.exceptions.InvalidArgumentException;
import com.mcmasterbaja.exceptions.SerialException;
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
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.StreamingOutput;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
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
  public RestResponse<StreamingOutput> runAnalyzer(@BeanParam AnalyzerParams params) {
    logger.info("Running analyzer with params: " + params.toString());

    if (!params.getErrors().isEmpty()) {
      throw new InvalidArgumentException(params.getErrors());
    }

    String requestId = UUID.randomUUID().toString();

    StreamingOutput stream =
        storageService.withTempDirectoryForStreaming(
            requestId,
            tempDir -> {
              // Update input files with rootLocation/csv
              params.updateInputFiles(storageService.getRootLocation());
              params.generateOutputFileNames(tempDir);
              Path targetPath = Path.of(params.getInputFiles()[0]);

              if (params.getType() != null) {
                Analyzer analyzer = analyzerFactory.getAnalyzer(params.getType());
                analyzer.analyze(params);
                logger.info(
                    "Analyzer completed: "
                        + params.getType()
                        + " -> "
                        + analyzer.getOutputFilename());
                targetPath = Path.of(analyzer.getOutputFilename());
              }

              Path finalTargetPath = targetPath;

              // Return StreamingOutput that will be wrapped with cleanup
              return output -> {
                try (FileInputStream fis = new FileInputStream(finalTargetPath.toFile())) {
                  fis.transferTo(output);
                }
              };
            });

    Path relativePath =
        storageService
            .load(Paths.get("csv"))
            .relativize(Path.of(params.getInputFiles()[0]).getFileName());

    return ResponseBuilder.ok(stream, "application/octet-stream")
        .header("Content-Disposition", "attachment; filename=\"" + relativePath.toString() + "\"")
        .header("Access-Control-Expose-Headers", "Content-Disposition")
        .build();
  }

  @POST
  @jakarta.ws.rs.Path("analyze/smart")
  @OnAnalyzerException
  public RestResponse<StreamingOutput> runSmartAnalyzer(
      @BeanParam SmartAnalyzerParams smartParams) {
    logger.info("Running smart analyzer with params: " + smartParams.toString());

    if (!smartParams.getErrors().isEmpty()) {
      throw new InvalidArgumentException(smartParams.getErrors());
    }

    String requestId = UUID.randomUUID().toString();

    StreamingOutput stream =
        storageService.withTempDirectoryForStreaming(
            requestId,
            tempDir -> {
              Path targetPath;

              if (smartAnalyzerService.needsPreprocessing(smartParams)) {
                // PREPROCESSING FLOW: Run INTERPOLATER_PRO first, then user's analyzer
                logger.info("Preprocessing needed - running two-stage analysis");

                // Stage 1: Run INTERPOLATER_PRO preprocessing
                AnalyzerParams preprocessParams =
                    smartAnalyzerService.createPreprocessingParams(smartParams);
                preprocessParams.updateInputFiles(storageService.getRootLocation());
                preprocessParams.generateOutputFileNames(tempDir);

                Analyzer preprocessAnalyzer =
                    analyzerFactory.getAnalyzer(AnalyzerType.INTERPOLATER_PRO);
                preprocessAnalyzer.analyze(preprocessParams);
                String preprocessedFile = preprocessAnalyzer.getOutputFilename();

                // Stage 2: Run user's analyzer on preprocessed data (if specified)
                if (smartParams.getType() != null) {
                  logger.info("Running user's analyzer: " + smartParams.getType());
                  AnalyzerParams userParams =
                      smartAnalyzerService.createUserAnalyzerParams(smartParams, preprocessedFile);
                  // Don't call updateInputFiles - preprocessedFile is already an absolute path
                  userParams.generateOutputFileNames(tempDir);

                  Analyzer userAnalyzer = analyzerFactory.getAnalyzer(smartParams.getType());

                  logger.info("User analyzer params: " + userParams.toString());

                  userAnalyzer.analyze(userParams);
                  logger.info(
                      "User analyzer completed: "
                          + smartParams.getType()
                          + " -> "
                          + userAnalyzer.getOutputFilename());
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
                  params.generateOutputFileNames(tempDir);

                  Analyzer analyzer = analyzerFactory.getAnalyzer(smartParams.getType());
                  analyzer.analyze(params);
                  logger.info(
                      "Analyzer completed: "
                          + smartParams.getType()
                          + " -> "
                          + analyzer.getOutputFilename());
                  targetPath = Path.of(analyzer.getOutputFilename());
                } else {
                  // No analyzer specified, return input file directly
                  targetPath = storageService.getRootLocation().resolve("csv").resolve(inputFile);
                }
              }

              Path finalTargetPath = targetPath;

              // Return StreamingOutput that will be wrapped with cleanup
              return output -> {
                try (FileInputStream fis = new FileInputStream(finalTargetPath.toFile())) {
                  fis.transferTo(output);
                }
              };
            });

    String filename = smartAnalyzerService.getDirectInputFile(smartParams);
    return ResponseBuilder.ok(stream, "application/octet-stream")
        .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
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
      new Thread(
              () -> {
                try {
                  serial.readLive();
                } catch (IOException e) {
                  throw new SerialException("Failed to read serial data");
                }
              })
          .start();
    }

    return exit;
  }
}
