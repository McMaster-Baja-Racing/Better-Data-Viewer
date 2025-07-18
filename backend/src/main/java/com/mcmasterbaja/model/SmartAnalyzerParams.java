package com.mcmasterbaja.model;

import jakarta.ws.rs.QueryParam;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class SmartAnalyzerParams {

  @QueryParam("xDataType")
  private String xDataType;

  @QueryParam("yDataType")
  private String yDataType;

  @QueryParam("xSource")
  private String xSource;

  @QueryParam("ySource")
  private String ySource;

  @QueryParam("type")
  private AnalyzerType type;

  @QueryParam("analyzerOptions")
  private List<String> analyzerOptions = new ArrayList<>();

  public List<String> getErrors() {
    List<String> errors = new ArrayList<>();

    if (xDataType == null || xDataType.trim().isEmpty()) {
      errors.add("xDataType is required");
    }

    if (yDataType == null || yDataType.trim().isEmpty()) {
      errors.add("yDataType is required");
    }

    if (xSource == null || xSource.trim().isEmpty()) {
      errors.add("xSource is required");
    }

    if (ySource == null || ySource.trim().isEmpty()) {
      errors.add("ySource is required");
    }

    return errors;
  }
}
