package com.mcmasterbaja.analyzer;

import com.mcmasterbaja.annotations.OnAnalyzerException;
import com.mcmasterbaja.exceptions.InvalidHeaderException;
import com.opencsv.CSVReader;
import com.opencsv.ICSVWriter;
import lombok.SneakyThrows;


import com.mcmasterbaja.model.AnalyzerParams;
import com.opencsv.CSVReader;
import com.opencsv.ICSVWriter;
import com.opencsv.exceptions.CsvException;
import jakarta.enterprise.context.Dependent;
import jakarta.inject.Inject;
import java.io.IOException;
import org.jboss.logging.Logger;

@Dependent
@OnAnalyzerException
public class DeleteOutliers extends Analyzer {
  private double limit;
  @Inject Logger logger;

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

    CSVReader reader = getReader(inputFiles[0]);
    ICSVWriter writer = getWriter(outputFiles[0]);

    String[] headers = reader.readNext();
    if (headers == null) {
      throw new InvalidHeaderException("Failed to read headers from input file: " + inputFiles[0]);
    }

    int xAxisIndex = this.getColumnIndex(inputColumns[0], headers);
    writer.writeNext(headers);

    String[] dataPoint;

    while ((dataPoint = reader.readNext()) != null) {
      if (Double.parseDouble(dataPoint[xAxisIndex]) <= this.limit) {
        writer.writeNext(dataPoint);
      }
    }

    reader.close();
    writer.close();
  }
}
