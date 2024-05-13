package com.mcmasterbaja.analyzer;

import com.opencsv.CSVReader;
import com.opencsv.ICSVWriter;
import com.opencsv.exceptions.CsvValidationException;
import java.io.IOException;

public class CubicAnalyzer extends Analyzer {
  // Form of y = ax^3 + bx^2 + cx + d
  private final double a;
  private final double b;
  private final double c;
  private final double d;

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

    System.out.println(
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
    // Should take in the inputFile as a stream and write to the outputFile as a stream

    CSVReader reader = getReader(inputFiles[0]);
    ICSVWriter writer = getWriter(outputFiles[0]);

    String[] headers = reader.readNext();
    // int independentColumn = this.getColumnIndex(inputColumns[0], headers);
    int dependentColumn = this.getColumnIndex(inputColumns[1], headers);

    // Write the headers to the output file
    writer.writeNext(headers);

    // In a loop, read the next line of the file and apply the cubic function to the dependent
    // column
    String[] nextLine;
    while ((nextLine = reader.readNext()) != null && nextLine.length > 1) {
      // double timestamp = Double.parseDouble(nextLine[independentColumn]);
      double data = Double.parseDouble(nextLine[dependentColumn]);
      double newValue = a * Math.pow(data, 3) + b * Math.pow(data, 2) + c * data + d;
      nextLine[dependentColumn] = Double.toString(newValue);
      writer.writeNext(nextLine);
    }

    reader.close();
    writer.close();
  }

  // Create a main to run cubicMultiply
  public static void main(String[] args) {
    String[] inputFiles = {
      "/Users/kai.arseneau/Documents/GitHub/Better-Data-Viewer/data/F_GPS_LATITUDE.csv"
    };
    String[] inputColumns = {"Timestamp (ms)", "F_GPS_LATITUDE"};
    String[] outputFiles = {
      "/Users/kai.arseneau/Documents/GitHub/Better-Data-Viewer/data/output.csv"
    };
    double a = 1;
    double b = 1;
    double c = 1;
    double d = 1;

    try {
      CubicAnalyzer cubicAnalyzer =
          new CubicAnalyzer(inputFiles, inputColumns, outputFiles, a, b, c, d);
      cubicAnalyzer.cubicMultiply(inputFiles, inputColumns, outputFiles, a, b, c, d);
    } catch (CsvValidationException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    }
  }
}
