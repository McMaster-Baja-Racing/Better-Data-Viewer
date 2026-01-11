package com.mcmasterbaja.services;

import com.mcmasterbaja.exceptions.InvalidArgumentException;
import com.mcmasterbaja.model.AnalyzerParams;
import com.mcmasterbaja.model.AnalyzerType;
import com.mcmasterbaja.model.SmartAnalyzerParams;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Stream;
import org.jboss.logging.Logger;

@ApplicationScoped
public class SmartAnalyzerService {

  @Inject Logger logger;

  @Inject StorageService storageService;

  private static final String TIMESTAMP_HEADER = "Timestamp (ms)";

  /** Check if preprocessing is needed based on the smart params */
  public boolean needsPreprocessing(SmartAnalyzerParams smartParams) {
    // Find files for the data types
    String xFile = findFileContainingDataType(smartParams.getXDataType(), smartParams.getXSource());
    String yFile = findFileContainingDataType(smartParams.getYDataType(), smartParams.getYSource());

    // Need preprocessing if files are different OR both data types are not timestamp
    boolean differentFiles = !xFile.equals(yFile);
    boolean nonTimestampData =
        !TIMESTAMP_HEADER.equals(smartParams.getXDataType().trim())
            && !TIMESTAMP_HEADER.equals(smartParams.getYDataType().trim());

    logger.info(
        "Preprocessing check - Different files: "
            + differentFiles
            + ", Non-timestamp data: "
            + nonTimestampData);

    return differentFiles && nonTimestampData;
  }

  /** Create preprocessing params for INTERPOLATER_PRO */
  public AnalyzerParams createPreprocessingParams(SmartAnalyzerParams smartParams) {
    String xFile = findFileContainingDataType(smartParams.getXDataType(), smartParams.getXSource());
    String yFile = findFileContainingDataType(smartParams.getYDataType(), smartParams.getYSource());

    AnalyzerParams params = new AnalyzerParams();
    params.setInputFiles(new String[] {xFile, yFile});
    params.setInputColumns(new String[] {smartParams.getXDataType(), smartParams.getYDataType()});
    params.setType(AnalyzerType.INTERPOLATER_PRO);
    params.setOptions(new String[0]);

    return params;
  }

  /** Create analyzer params for the user's chosen analyzer using the specified input file */
  public AnalyzerParams createUserAnalyzerParams(
      SmartAnalyzerParams smartParams, String inputFile) {
    AnalyzerParams params = new AnalyzerParams();
    params.setInputFiles(new String[] {inputFile});
    params.setInputColumns(new String[] {smartParams.getXDataType(), smartParams.getYDataType()});
    params.setType(smartParams.getType());
    params.setOptions(smartParams.getAnalyzerOptions().toArray(new String[0]));

    return params;
  }

  /** Get the appropriate input file when no preprocessing is needed */
  public String getDirectInputFile(SmartAnalyzerParams smartParams) {
    String xFile = findFileContainingDataType(smartParams.getXDataType(), smartParams.getXSource());
    String yFile = findFileContainingDataType(smartParams.getYDataType(), smartParams.getYSource());

    // If X is timestamp and files are different, use Y file (since every file has timestamps)
    if (TIMESTAMP_HEADER.equals(smartParams.getXDataType()) && !xFile.equals(yFile)) {
      return yFile;
    }

    // Otherwise use X file (which equals Y file if they're the same)
    return xFile;
  }

  private String findFileContainingDataType(String dataType, String sourcePath) {
    try {
      Path sourceFullPath = storageService.getRootLocation().resolve("csv").resolve(sourcePath);

      if (!Files.exists(sourceFullPath)) {
        throw new InvalidArgumentException("Source path does not exist: " + sourcePath);
      }

      // Check if it's a direct file request (dataType.csv)
      String directFileName = dataType + ".csv";
      Path directFile = sourceFullPath.resolve(directFileName);
      if (Files.exists(directFile)) {
        return sourcePath + "/" + directFileName;
      }

      // Search through all CSV files in the source path
      try (Stream<Path> files = Files.list(sourceFullPath)) {
        return files
            .filter(path -> path.toString().endsWith(".csv"))
            .filter(path -> fileContainsHeader(path, dataType))
            .findFirst()
            .map(path -> sourcePath + "/" + path.getFileName().toString())
            .orElseThrow(
                () ->
                    new InvalidArgumentException(
                        "No file found containing data type: "
                            + dataType
                            + " in source: "
                            + sourcePath));
      }
    } catch (IOException e) {
      throw new InvalidArgumentException(
          "Error searching for data type: " + dataType + " in source: " + sourcePath, e);
    }
  }

  private boolean fileContainsHeader(Path filePath, String header) {
    try {
      List<String> lines = Files.readAllLines(filePath);
      if (lines.isEmpty()) return false;

      String headerLine = lines.get(0);
      String[] headers = headerLine.split(",");

      for (String h : headers) {
        if (h.trim().equals(header.trim())) {
          return true;
        }
      }
      return false;
    } catch (IOException e) {
      logger.warn("Error reading file: " + filePath, e);
      return false;
    }
  }
}
