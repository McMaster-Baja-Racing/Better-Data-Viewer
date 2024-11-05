package com.mcmasterbaja.analyzer;

import com.opencsv.CSVReader;
import com.opencsv.ICSVWriter;
import com.opencsv.exceptions.CsvException;
import java.io.IOException;

public class DeleteOutliers extends Analyzer {
  private final double limit;

  public DeleteOutliers(
      String[] inputFiles, String[] inputColumns, String[] outputFiles, double limit) {
    super(inputFiles, inputColumns, outputFiles);
    this.limit = limit;
  }

  public void analyze() throws IOException, CsvException {
    System.out.println(
        "Deleting outliers from "
            + super.inputFiles[0]
            + " to "
            + super.outputFiles[0]
            + " with a limit of "
            + this.limit);

    CSVReader reader = getReader(inputFiles[0]);
    ICSVWriter writer = getWriter(outputFiles[0]);

    // Create a single data point with the average
    String[] dataPoint;

    writer.writeNext(reader.readNext());

    while ((dataPoint = reader.readNext()) != null) {
      if (Double.parseDouble(dataPoint[1]) <= this.limit) {
        writer.writeNext(dataPoint);
      }
    }

    writer.close();
  }
}
