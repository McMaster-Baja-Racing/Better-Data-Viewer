package com.mcmasterbaja.analyzer;

import org.jboss.logging.Logger;

import com.mcmasterbaja.annotations.OnAnalyzerException;
import com.mcmasterbaja.exceptions.InvalidHeaderException;
import com.mcmasterbaja.model.AnalyzerParams;
import com.mcmasterbaja.model.AnalyzerType;
import com.opencsv.CSVReader;
import com.opencsv.ICSVWriter;

import jakarta.enterprise.context.Dependent;
import jakarta.inject.Inject;
import lombok.SneakyThrows;

@Dependent
@AnalyzerQualifier(AnalyzerType.LINEAR_MULTIPLY)
@OnAnalyzerException
public class LinearMultiplyAnalyzer extends Analyzer {
  private double m;
  private double b;

  @Inject
  Logger logger;

  @Override
  @SneakyThrows
  public void analyze(AnalyzerParams params) {
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

    getReader(
        inputFiles[0],
        reader -> {
          getWriter(
              outputFiles[0],
              writer -> {
                linearIO(reader, writer, inputColumns);
              });
        });
  }

  @SneakyThrows
  private void linearIO(CSVReader reader, ICSVWriter writer, String[] inputColumns) {
    String[] headers = reader.readNext();
    if (headers == null) {
      throw new InvalidHeaderException(
          "Failed to read headers from input file: " + inputFiles[0]);
    }

    int xAxisIndex = this.getColumnIndex(inputColumns[0], headers);
    int yAxisIndex = this.getColumnIndex(inputColumns[1], headers);
    writer.writeNext(headers);

    String[] dataPoint;

    while ((dataPoint = reader.readNext()) != null) {
      String x = dataPoint[xAxisIndex];
      double oldY = Double.parseDouble(dataPoint[yAxisIndex]);
      String newY = Double.toString(linearFunction(oldY));
      writer.writeNext(new String[] { x, newY });
    }
  }

  private double linearFunction(double x) {
    return m * x + b;
  }
}
