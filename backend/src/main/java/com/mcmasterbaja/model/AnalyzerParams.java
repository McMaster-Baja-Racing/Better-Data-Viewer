package com.mcmasterbaja.model;

import jakarta.ws.rs.QueryParam;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class AnalyzerParams {
  // Input and output files defined as strings in order for serialization in quarkus
  @QueryParam("inputFiles")
  private String[] inputFiles;

  @QueryParam("outputFiles")
  private String[] outputFiles;

  @QueryParam("inputColumns")
  private String[] inputColumns;

  @QueryParam("type")
  private AnalyzerType type;

  @QueryParam("analyzerOptions")
  private String[] options;

  public List<String> getErrors() {
    ArrayList<String> errors = new ArrayList<String>();

    if (inputFiles == null || inputFiles.length == 0) {
      errors.add("inputFiles cannot be empty");
    }
    if (inputColumns == null || inputColumns.length == 0) {
      errors.add("inputColumns cannot be empty");
    }

    return errors;
  }

  /**
   * Converts to absolute path within the rootLocation/csv/ directory
   *
   * @param rootLocation the root location of the storage service
   */
  public void updateInputFiles(Path rootLocation) {
    if (inputFiles != null) {
      inputFiles =
          Arrays.stream(inputFiles)
              .map(Paths::get)
              .map(rootLocation.resolve("csv")::resolve)
              .map(Path::toString)
              .toArray(String[]::new);
    }
  }

  /** If output files are empty, auto-populates them with the format: inputFile_type.csv */
  public void generateOutputFileNames() {
    if (outputFiles == null || outputFiles.length == 0) {
      outputFiles = new String[inputFiles.length];
      for (int i = 0; i < inputFiles.length; i++) {
        if (type == null) {
          outputFiles[i] = inputFiles[i];
        } else {
          outputFiles[i] = inputFiles[i].replace(".csv", "_" + type.toString() + ".csv");
        }
      }
    }
  }
}
