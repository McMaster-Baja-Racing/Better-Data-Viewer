package com.mcmasterbaja.analyzer;

import com.opencsv.CSVReader;
import com.opencsv.ICSVWriter;
import com.opencsv.exceptions.CsvValidationException;

import jakarta.inject.Inject;

import java.io.IOException;

import org.jboss.logging.Logger;

public class ConstantAdderAnalyzer extends Analyzer {
  private final double a;
  private final double b;
  private final double c;
  private final double d;

  @Inject Logger logger;

  public ConstantAdderAnalyzer(
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

  public void analyze() throws IOException, CsvValidationException {

    logger.info(
        "Add a constant value to a file named"
            + super.inputFiles[0]
            + " to make "
            + super.outputFiles[0]);
    CSVReader reader = getReader(super.inputFiles[0]);
    ICSVWriter writer = getWriter(super.outputFiles[0]);
    if (inputColumns.length == 4) {
      String[] headers = reader.readNext();
      int aIndex = this.getColumnIndex(inputColumns[0], headers);
      int bIndex = this.getColumnIndex(inputColumns[1], headers);
      int cIndex = this.getColumnIndex(inputColumns[2], headers);
      int dIndex = this.getColumnIndex(inputColumns[3], headers);
      writer.writeNext(headers);
      String[] dataPoint;
      while ((dataPoint = reader.readNext()) != null) {
        // takes original variable and adds the constant
        double oldA = Double.parseDouble(dataPoint[aIndex]);
        String newA = Double.toString(oldA + a);
        double oldB = Double.parseDouble(dataPoint[bIndex]);
        String newB = Double.toString(oldB + b);
        double oldC = Double.parseDouble(dataPoint[cIndex]);
        String newC = Double.toString(oldC + c);
        double oldD = Double.parseDouble(dataPoint[dIndex]);
        String newD = Double.toString(oldD + d);
        writer.writeNext(new String[] {newA, newB, newC, newD});
      }
      reader.close();
      writer.close();
    }
  }
}
