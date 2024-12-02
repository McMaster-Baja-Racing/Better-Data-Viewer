package com.mcmasterbaja.analyzer;

import java.io.IOException;

import org.jboss.logging.Logger;

import com.opencsv.CSVReader;
import com.opencsv.ICSVWriter;
import com.opencsv.exceptions.CsvException;

import jakarta.inject.Inject;

public class DeleteOutliers extends Analyzer {
  private final double limit;
  @Inject Logger logger;

  // This class deletes all data points that are above a certain limit
  public DeleteOutliers(
      String[] inputFiles, String[] inputColumns, String[] outputFiles, double limit) {
    super(inputFiles, inputColumns, outputFiles);
    this.limit = limit;
  }

  public void analyze() throws IOException, CsvException {
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
