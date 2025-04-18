package com.mcmasterbaja.analyzer;

import com.mcmasterbaja.annotations.OnAnalyzerException;
import com.mcmasterbaja.exceptions.InvalidHeaderException;
import com.mcmasterbaja.model.AnalyzerParams;
import com.mcmasterbaja.model.AnalyzerType;
import com.opencsv.CSVReader;
import com.opencsv.ICSVWriter;
import jakarta.enterprise.context.Dependent;
import jakarta.inject.Inject;
import lombok.SneakyThrows;
import org.jboss.logging.Logger;

@Dependent
@AnalyzerQualifier(AnalyzerType.CONSTANT_ADDER)
@OnAnalyzerException
public class ConstantAdderAnalyzer extends Analyzer {
  private double a;
  private double b;
  private double c;
  private double d;

  @Inject Logger logger;

  @SneakyThrows
  public void analyze(AnalyzerParams params) {
    a = Double.parseDouble(params.getOptions()[0]);
    b = Double.parseDouble(params.getOptions()[1]);
    c = Double.parseDouble(params.getOptions()[2]);
    d = Double.parseDouble(params.getOptions()[3]);
    extractParams(params);

    logger.info(
        "Add a constant value to a file named"
            + super.inputFiles[0]
            + " to make "
            + super.outputFiles[0]);

    getReader(
        super.inputFiles[0],
        reader -> {
          getWriter(
              super.outputFiles[0],
              writer -> {
                constantIO(reader, writer, super.inputColumns);
              });
        });
  }

  @SneakyThrows
  public void constantIO(CSVReader reader, ICSVWriter writer, String[] inputColumns) {
    if (inputColumns.length == 4) {
      String[] headers = reader.readNext();
      if (headers == null) {
        throw new InvalidHeaderException(
            "Failed to read headers from input file: " + inputFiles[0]);
      }
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
    }
  }
}
