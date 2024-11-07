package com.mcmasterbaja.analyzer;

import com.opencsv.CSVReader;
import com.opencsv.ICSVWriter;
import com.opencsv.exceptions.CsvValidationException;
import java.io.IOException;

public class ConstantAdderAnalyzer extends Analyzer {
  private final double a;
  private final double b;
  private final double c;
  private final double d;

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

    System.out.println(
        "Add a constant value to a file named"
            + super.inputFiles[0]
            + " to make "
            + super.outputFiles[0]);
    CSVReader r = getReader(super.inputFiles[0]);
    ICSVWriter w = getWriter(super.outputFiles[0]);
    if (inputColumns.length == 4) {
      String[] headers = r.readNext();
      int aIndex = this.getColumnIndex(inputColumns[0], headers);
      int bIndex = this.getColumnIndex(inputColumns[1], headers);
      int cIndex = this.getColumnIndex(inputColumns[2], headers);
      int dIndex = this.getColumnIndex(inputColumns[3], headers);
      w.writeNext(headers);
      String[] dataPoint;
      while ((dataPoint = r.readNext()) != null) {
        // takes original variable and adds the constant
        double oldA = Double.parseDouble(dataPoint[aIndex]);
        String newA = Double.toString(constantAdder(oldA, a));
        double oldB = Double.parseDouble(dataPoint[bIndex]);
        String newB = Double.toString(constantAdder(oldB, b));
        double oldC = Double.parseDouble(dataPoint[cIndex]);
        String newC = Double.toString(constantAdder(oldC, c));
        double oldD = Double.parseDouble(dataPoint[dIndex]);
        String newD = Double.toString(constantAdder(oldD, d));
        w.writeNext(new String[] {newA, newB, newC, newD});
      }
      r.close();
      w.close();
    }
  }

  // adds the variable of the line with the constant
  private double constantAdder(double var, double constant) throws IOException {
    return var + constant;
  }

  public static void main(String[] args) {}
}
