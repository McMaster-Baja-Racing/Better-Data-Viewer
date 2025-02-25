package com.mcmasterbaja.analyzer;

import org.jboss.logging.Logger;

import com.mcmasterbaja.annotations.OnAnalyzerException;
import com.mcmasterbaja.exceptions.InvalidHeaderException;
import com.mcmasterbaja.model.AnalyzerParams;
import com.mcmasterbaja.model.AnalyzerType;
import com.opencsv.CSVReader;
import com.opencsv.ICSVWriter;

import jakarta.enterprise.context.Dependent;
import jakarta.inject.Inject;
import lombok.SneakyThrows;

@Dependent
@AnalyzerQualifier(AnalyzerType.DELETE_OUTLIER)
@OnAnalyzerException
public class DeleteOutliers extends Analyzer {
  private double limit;
  @Inject
  Logger logger;

  @SneakyThrows
  public void analyze(AnalyzerParams params) {
    this.limit = Double.parseDouble(params.getOptions()[0]);
    extractParams(params);

    logger.info(
        "Deleting outliers from "
            + super.inputFiles[0]
            + " to "
            + super.outputFiles[0]
            + " with a limit of "
            + this.limit);

    getReader(
        inputFiles[0],
        reader -> {
          getWriter(
              outputFiles[0],
              writer -> {
                deleteIO(reader, writer, inputColumns);
              });
        });
  }

  @SneakyThrows
  public void deleteIO(CSVReader reader, ICSVWriter writer, String[] inputColumns) {
    String[] headers = reader.readNext();
    if (headers == null) {
      throw new InvalidHeaderException(
          "Failed to read headers from input file: " + inputFiles[0]);
    }

    logger.debug(inputColumns[0]);
    int xAxisIndex = this.getColumnIndex(inputColumns[1], headers);
    writer.writeNext(headers);

    String[] dataPoint;

    while ((dataPoint = reader.readNext()) != null) {
      if (Double.parseDouble(dataPoint[xAxisIndex]) <= this.limit) {
        writer.writeNext(dataPoint);
      }
    }
  }
}
