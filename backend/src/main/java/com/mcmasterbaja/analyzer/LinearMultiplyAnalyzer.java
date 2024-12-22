package com.mcmasterbaja.analyzer;

import com.mcmasterbaja.model.AnalyzerEnum;
import com.mcmasterbaja.model.AnalyzerParams;
import com.opencsv.CSVReader;
import com.opencsv.ICSVWriter;
import com.opencsv.exceptions.CsvException;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import java.io.IOException;
import org.jboss.logging.Logger;

@RequestScoped
@AnalyzerType(AnalyzerEnum.LINEAR_MULTIPLY)
public class LinearMultiplyAnalyzer extends Analyzer {
  private double m;
  private double b;

  @Inject Logger logger;

  @Override
  public void analyze(AnalyzerParams params) throws IOException, CsvException {
    extractParams(params);
    this.m = Double.parseDouble(params.getOptions()[0]);
    this.b = Double.parseDouble(params.getOptions()[1]);

    logger.info(
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

    reader.close();
    writer.close();
  }

  private double linearFunction(double x) {
    return m * x + b;
  }
}
