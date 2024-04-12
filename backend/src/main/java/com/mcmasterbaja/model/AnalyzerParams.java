package com.mcmasterbaja.model;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;

import jakarta.ws.rs.QueryParam;
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

  @QueryParam("analyzerType")
  private AnalyzerType type;

  @QueryParam("analyzerOptions")
  private String[] options;

  @QueryParam("liveOptions")
  private Boolean live;

  public boolean isValid() {
    return inputFiles != null && inputFiles.length != 0 && inputColumns != null;
  }

  public void updateInputFiles(Path rootLocation) {
    if (inputFiles != null) {
      inputFiles = Arrays.stream(inputFiles)
          .map(Paths::get)
          .map(rootLocation::resolve)
          .map(Path::toString)
          .toArray(String[]::new);
    }
  }

  public void generateOutputFileNames() {
    if (outputFiles == null || outputFiles.length == 0) {
      outputFiles = new String[inputFiles.length];
      for (int i = 0; i < inputFiles.length; i++) {
        outputFiles[i] = inputFiles[i].replace(".csv", "_" + type.toString() + ".csv");
      }
    }
  }
  
}
