package com.mcmasterbaja.analyzer;

import com.opencsv.CSVReader;
import com.opencsv.ICSVWriter;
import com.opencsv.exceptions.CsvValidationException;
import java.io.IOException;

public class BullshitAnalyzer extends Analyzer {

  // The point of this analyzer is to add a bunch of fake points based on an input, between
  // different pre-existing points (input file) to make it seem like there is some fake noise

  private final double numPoints;

  public BullshitAnalyzer(
      String[] inputFiles, String[] inputColumns, String[] outputFiles, double numPoints) {
    super(inputFiles, inputColumns, outputFiles);
    this.numPoints = numPoints;
  }

  public void analyze() throws IOException, CsvValidationException {
    System.out.println(
        "Adding "
            + numPoints
            + " fake points to "
            + super.inputFiles[0]
            + " to "
            + super.outputFiles[0]);

    CSVReader reader = getReader(super.inputFiles[0]);
    ICSVWriter writer = getWriter(super.outputFiles[0]);

    String[] headers = reader.readNext();

    int xAxisIndex = this.getColumnIndex(inputColumns[0], headers);
    int yAxisIndex = this.getColumnIndex(inputColumns[1], headers);

    writer.writeNext(headers);

    String[] lastDataPoint = reader.readNext();
    String[] dataPoint;

    while ((dataPoint = reader.readNext()) != null) {
      double prevX = Double.parseDouble(lastDataPoint[xAxisIndex]);
      double currX = Double.parseDouble(dataPoint[xAxisIndex]);
      double prevY = Double.parseDouble(lastDataPoint[yAxisIndex]);
      double currY = Double.parseDouble(dataPoint[yAxisIndex]);

      double realNumPoints = Math.abs(currX - prevX) * numPoints;

      for (int i = 0; i < realNumPoints; i++) {
        double xValue = prevX + ((currX - prevX) * (1.0 / realNumPoints) * i);

        double slope = (currY - prevY) / (currX - prevX);
        double yValue = prevY + (xValue - prevX) * slope;

        // TODO: This noise is relative to the yValue, so it will be more pronounced for larger
        // values. Downside is higher y-values have higher noise
        double noise = yValue * (0.75 + Math.random() * 0.5);
        writer.writeNext(new String[] {Double.toString(xValue), Double.toString(noise)});
      }

      lastDataPoint = dataPoint;
    }

    writer.close();
  }
}
