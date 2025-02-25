package com.mcmasterbaja.analyzer;

import org.jboss.logging.Logger;

import com.mcmasterbaja.annotations.OnAnalyzerException;
import com.mcmasterbaja.exceptions.InvalidHeaderException;
import com.mcmasterbaja.model.AnalyzerParams;
import com.opencsv.CSVReader;
import com.opencsv.ICSVWriter;

import jakarta.enterprise.context.Dependent;
import jakarta.inject.Inject;
import lombok.SneakyThrows;

@Dependent
@OnAnalyzerException
public class BullshitAnalyzer extends Analyzer {

  // The point of this analyzer is to add a bunch of fake points based on an
  // input, between
  // different pre-existing points (input file) to make it seem like there is some
  // fake noise

  private double numPoints;

  @Inject
  Logger logger;

  @SneakyThrows
  public void analyze(AnalyzerParams params) {
    numPoints = Double.parseDouble(params.getOptions()[0]);
    extractParams(params);

    logger.info(
        "Adding "
            + numPoints
            + " fake points to "
            + super.inputFiles[0]
            + " to "
            + super.outputFiles[0]);

    getReader(
        super.inputFiles[0],
        reader -> {
          getWriter(
              super.outputFiles[0],
              writer -> {
                bullshitIO(reader, writer);
              });
        });
  }

  @SneakyThrows
  public void bullshitIO(CSVReader reader, ICSVWriter writer) {
    String[] headers = reader.readNext();
    if (headers == null) {
      throw new InvalidHeaderException(
          "Failed to read headers from input file: " + inputFiles[0]);
    }

    int xAxisIndex = this.getColumnIndex(inputColumns[0], headers);
    int yAxisIndex = this.getColumnIndex(inputColumns[1], headers);

    writer.writeNext(headers);

    String[] lastDataPoint = reader.readNext();
    String[] dataPoint;

    while ((dataPoint = reader.readNext()) != null) {
      double prevX = Double.parseDouble(lastDataPoint[xAxisIndex]);
      double currX = Double.parseDouble(dataPoint[xAxisIndex]);
      double prevY = Double.parseDouble(lastDataPoint[yAxisIndex]);
      double currY = Double.parseDouble(dataPoint[yAxisIndex]);

      double realNumPoints = Math.abs(currX - prevX) * numPoints;

      for (int i = 0; i < realNumPoints; i++) {
        double xValue = prevX + ((currX - prevX) * (1.0 / realNumPoints) * i);

        double slope = (currY - prevY) / (currX - prevX);
        double yValue = prevY + (xValue - prevX) * slope;

        // TODO: This noise is relative to the yValue, so it will be more pronounced for
        // larger
        // values. Downside is higher y-values have higher noise
        double noise = yValue * (0.75 + Math.random() * 0.5);
        writer.writeNext(
            new String[] { Double.toString(xValue), Double.toString(noise) });
      }

      lastDataPoint = dataPoint;
    }
  }
}
