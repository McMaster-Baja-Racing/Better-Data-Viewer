package com.mcmasterbaja.analyzer;

import com.mcmasterbaja.model.AnalyzerParams;
import com.opencsv.CSVReader;
import com.opencsv.ICSVWriter;
import com.opencsv.exceptions.CsvValidationException;
import jakarta.enterprise.context.Dependent;
import jakarta.inject.Inject;
import java.io.IOException;
import org.jboss.logging.Logger;

@Dependent
public class BullshitAnalyzer extends Analyzer {

  // The point of this analyzer is to add a bunch of fake points based on an input, between
  // different pre-existing points (input file) to make it seem like there is some fake noise

  private double numPoints;

  @Inject Logger logger;

  public void analyze(AnalyzerParams params) throws IOException, CsvValidationException {
    numPoints = Double.parseDouble(params.getOptions()[0]);
    extractParams(params);

    logger.info(
        "Adding "
            + numPoints
            + " fake points to "
            + super.inputFiles[0]
            + " to "
            + super.outputFiles[0]);

    CSVReader reader = getReader(super.inputFiles[0]);
    ICSVWriter writer = getWriter(super.outputFiles[0]);

    String[] headers = reader.readNext();

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

        // TODO: This noise is relative to the yValue, so it will be more pronounced for larger
        // values. Downside is higher y-values have higher noise
        double noise = yValue * (0.75 + Math.random() * 0.5);
        writer.writeNext(new String[] {Double.toString(xValue), Double.toString(noise)});
      }

      lastDataPoint = dataPoint;
    }

    reader.close();
    writer.close();
  }
}
