package com.mcmasterbaja.analyzer;

import com.opencsv.CSVReader;
import com.opencsv.ICSVWriter;
import com.opencsv.exceptions.CsvException;
import java.io.IOException;

public class LinearMultiplyAnalyzer extends Analyzer {
  private final double m;
  private final double b;

  public LinearMultiplyAnalyzer(
      String[] inputFiles, String[] inputColumns, String[] outputFiles, double m, double b) {
    super(inputFiles, inputColumns, outputFiles);
    this.m = m;
    this.b = b;
  }

  @Override
  public void analyze() throws IOException, CsvException {

    System.out.println(
        "Multiplyinh the file named"
            + super.inputFiles[0]
            + " to "
            + super.outputFiles[0]
            + " with a m value of "
            + m
            + " and an offset value of "
            + b);

    CSVReader reader = getReader(inputFiles[0]);
    ICSVWriter writer = getWriter(outputFiles[0]);

    String[] headers = reader.readNext();
    int xAxisIndex = this.getColumnIndex(inputColumns[0], headers);
    int yAxisIndex = this.getColumnIndex(inputColumns[1], headers);
    writer.writeNext(headers);

    String[] dataPoint;

    while ((dataPoint = reader.readNext()) != null) {
      String x = dataPoint[xAxisIndex];
      double oldY = Double.parseDouble(dataPoint[yAxisIndex]);
      String newY = Double.toString(linearFunction(oldY));
      writer.writeNext(new String[] {x, newY});
    }
  }

  private double linearFunction(double x) {
    return m * x + b;
  }
}
