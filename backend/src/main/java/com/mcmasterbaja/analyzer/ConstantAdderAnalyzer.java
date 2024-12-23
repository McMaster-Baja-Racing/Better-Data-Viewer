package com.mcmasterbaja.analyzer;

import com.mcmasterbaja.model.AnalyzerType;
import com.mcmasterbaja.model.AnalyzerParams;
import com.opencsv.CSVReader;
import com.opencsv.ICSVWriter;
import com.opencsv.exceptions.CsvValidationException;
import jakarta.enterprise.context.Dependent;
import jakarta.inject.Inject;
import java.io.IOException;
import org.jboss.logging.Logger;

@Dependent
@AnalyzerTypeQualifier(AnalyzerType.CONSTANT_ADDER)
public class ConstantAdderAnalyzer extends Analyzer {
  private double a;
  private double b;
  private double c;
  private double d;

  @Inject Logger logger;

  public void analyze(AnalyzerParams params) throws IOException, CsvValidationException {
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
