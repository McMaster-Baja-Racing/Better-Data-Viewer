package com.mcmasterbaja.analyzer;

import com.mcmasterbaja.annotations.OnAnalyzerException;
import com.mcmasterbaja.exceptions.InvalidHeaderException;
import com.mcmasterbaja.model.AnalyzerParams;
import com.mcmasterbaja.model.AnalyzerType;
import com.opencsv.CSVReader;
import com.opencsv.ICSVWriter;
import jakarta.enterprise.context.Dependent;
import jakarta.inject.Inject;
import lombok.SneakyThrows;
import org.jboss.logging.Logger;

@Dependent
@AnalyzerQualifier(AnalyzerType.DELETE_OUTLIER)
@OnAnalyzerException
public class DeleteOutliers extends Analyzer {
  private double minX;
  private double maxX;
  private double minY;
  private double maxY;
  @Inject Logger logger;

  @SneakyThrows
  public void analyze(AnalyzerParams params) {
    extractParams(params);

    this.minX = Double.parseDouble(params.getOptions()[0]);
    this.maxX = Double.parseDouble(params.getOptions()[1]);
    this.minY = Double.parseDouble(params.getOptions()[2]);
    this.maxY = Double.parseDouble(params.getOptions()[3]);

    logger.info(
        "Deleting outliers from "
            + super.inputFiles[0]
            + " to "
            + super.outputFiles[0]
            + " with x-axis range ["
            + minX
            + ", "
            + maxX
            + "] and y-axis range ["
            + minY
            + ", "
            + maxY
            + "]");

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
      throw new InvalidHeaderException("Failed to read headers from input file: " + inputFiles[0]);
    }

    int xAxisIndex = this.getColumnIndex(inputColumns[0], headers);
    int yAxisIndex = this.getColumnIndex(inputColumns[1], headers);
    writer.writeNext(headers);

    String[] dataPoint;

    while ((dataPoint = reader.readNext()) != null) {
      if (minX <= Double.parseDouble(dataPoint[xAxisIndex])
          && Double.parseDouble(dataPoint[xAxisIndex]) <= maxX
          && minY <= Double.parseDouble(dataPoint[yAxisIndex])
          && Double.parseDouble(dataPoint[yAxisIndex]) <= maxY) {
        writer.writeNext(dataPoint);
      }
    }
  }
}
