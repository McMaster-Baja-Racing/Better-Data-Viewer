package com.mcmasterbaja.analyzer;

import com.mcmasterbaja.annotations.OnAnalyzerException;
import com.mcmasterbaja.exceptions.InvalidHeaderException;
import com.opencsv.CSVReader;
import com.opencsv.ICSVWriter;

import lombok.SneakyThrows;

@OnAnalyzerException
public class DeleteOutliers extends Analyzer {
  private final double limit;

  // This class deletes all data points that are above a certain limit
  public DeleteOutliers(
      String[] inputFiles, String[] inputColumns, String[] outputFiles, double limit) {
    super(inputFiles, inputColumns, outputFiles);
    this.limit = limit;
  }

  @SneakyThrows
  public void analyze() {
    System.out.println(
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
