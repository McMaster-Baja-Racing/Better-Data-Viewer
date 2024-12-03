package com.mcmasterbaja.analyzer;

import java.io.IOException;

import org.jboss.logging.Logger;

import com.opencsv.CSVReader;
import com.opencsv.ICSVWriter;
import com.opencsv.exceptions.CsvValidationException;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;

@RequestScoped
public class CubicAnalyzer extends Analyzer {
  // Form of y = ax^3 + bx^2 + cx + d
  private final double a;
  private final double b;
  private final double c;
  private final double d;

  @Inject Logger logger;

  public CubicAnalyzer(
      String[] inputFiles,
      String[] inputColumns,
      String[] outputFiles,
      double a,
      double b,
      double c,
      double d) {
    super(inputFiles, inputColumns, outputFiles);
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
  }

  @Override
  public void analyze() {

    logger.info(
        "Applying the cubic function"
            + this.a
            + "x^3 + "
            + this.b
            + "x^2 + "
            + this.c
            + "x + "
            + this.d
            + " to the file "
            + super.inputFiles[0]);

    try {
      cubicMultiply(
          super.inputFiles, super.inputColumns, super.outputFiles, this.a, this.b, this.c, this.d);
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  public void cubicMultiply(
      String[] inputFiles,
      String[] inputColumns,
      String[] outputFiles,
      double a,
      double b,
      double c,
      double d)
      throws CsvValidationException, IOException {

    CSVReader reader = getReader(inputFiles[0]);
    ICSVWriter writer = getWriter(outputFiles[0]);

    String[] headers = reader.readNext();
    int xAxisIndex = this.getColumnIndex(inputColumns[0], headers);
    int yAxisIndex = this.getColumnIndex(inputColumns[1], headers);
    writer.writeNext(headers);

    String[] nextLine;
    while ((nextLine = reader.readNext()) != null && nextLine.length > 1) {
      double timestamp = Double.parseDouble(nextLine[xAxisIndex]);
      double data = Double.parseDouble(nextLine[yAxisIndex]);
      double newValue = cubicFunction(data);
      writer.writeNext(new String[] {Double.toString(timestamp), Double.toString(newValue)});
    }

    reader.close();
    writer.close();
  }

  private double cubicFunction(double x) {
    return this.a * Math.pow(x, 3) + this.b * Math.pow(x, 2) + this.c * x + this.d;
  }
}
