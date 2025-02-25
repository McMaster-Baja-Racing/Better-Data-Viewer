package com.mcmasterbaja.analyzer;

import org.jboss.logging.Logger;

import com.mcmasterbaja.annotations.OnAnalyzerException;
import com.mcmasterbaja.exceptions.InvalidHeaderException;
import com.mcmasterbaja.model.AnalyzerParams;
import com.mcmasterbaja.model.AnalyzerType;

import jakarta.enterprise.context.Dependent;
import jakarta.inject.Inject;

@Dependent
@AnalyzerQualifier(AnalyzerType.CUBIC)
@OnAnalyzerException
public class CubicAnalyzer extends Analyzer {
  // Form of y = ax^3 + bx^2 + cx + d
  private double a;
  private double b;
  private double c;
  private double d;

  @Inject
  Logger logger;

  @Override
  public void analyze(AnalyzerParams params) {
    this.a = Double.parseDouble(params.getOptions()[0]);
    this.b = Double.parseDouble(params.getOptions()[1]);
    this.c = Double.parseDouble(params.getOptions()[2]);
    this.d = Double.parseDouble(params.getOptions()[3]);
    extractParams(params);

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
      logger.error(e);
    }

    logger.info("Finished applying the cubic function to the file " + super.inputFiles[0]);
  }

  public void cubicMultiply(
      String[] inputFiles,
      String[] inputColumns,
      String[] outputFiles,
      double a,
      double b,
      double c,
      double d) {

    getReader(inputFiles[0], reader -> {
      getWriter(outputFiles[0], writer -> {
        String[] headers = safeReadNext(reader);
        if (headers == null) {
          throw new InvalidHeaderException("Failed to read headers from input file: " + inputFiles[0]);
        }

        int xAxisIndex = this.getColumnIndex(inputColumns[0], headers);
        int yAxisIndex = this.getColumnIndex(inputColumns[1], headers);
        writer.writeNext(headers);

        String[] nextLine;
        while ((nextLine = safeReadNext(reader)) != null && nextLine.length > 1) {
          double timestamp = Double.parseDouble(nextLine[xAxisIndex]);
          double data = Double.parseDouble(nextLine[yAxisIndex]);
          double newValue = cubicFunction(data);
          writer.writeNext(new String[] { Double.toString(timestamp), Double.toString(newValue) });
        }
      });
    });
  }

  private double cubicFunction(double x) {
    return this.a * Math.pow(x, 3) + this.b * Math.pow(x, 2) + this.c * x + this.d;
  }
}
