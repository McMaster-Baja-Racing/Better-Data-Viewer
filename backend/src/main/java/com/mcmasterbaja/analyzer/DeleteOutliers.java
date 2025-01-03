package com.mcmasterbaja.analyzer;

import com.mcmasterbaja.model.AnalyzerParams;
import com.opencsv.CSVReader;
import com.opencsv.ICSVWriter;
import com.opencsv.exceptions.CsvException;
import jakarta.enterprise.context.Dependent;
import jakarta.inject.Inject;
import java.io.IOException;
import org.jboss.logging.Logger;

@Dependent
public class DeleteOutliers extends Analyzer {
  private double limit;
  @Inject Logger logger;

  public void analyze(AnalyzerParams params) throws IOException, CsvException {
    this.limit = Double.parseDouble(params.getOptions()[0]);
    extractParams(params);

    logger.info(
        "Deleting outliers from "
            + super.inputFiles[0]
            + " to "
            + super.outputFiles[0]
            + " with a limit of "
            + this.limit);

    CSVReader reader = getReader(inputFiles[0]);
    ICSVWriter writer = getWriter(outputFiles[0]);

    String[] headers = reader.readNext();
    int xAxisIndex = this.getColumnIndex(inputColumns[0], headers);
    writer.writeNext(headers);

    String[] dataPoint;

    while ((dataPoint = reader.readNext()) != null) {
      if (Double.parseDouble(dataPoint[xAxisIndex]) <= this.limit) {
        writer.writeNext(dataPoint);
      }
    }

    reader.close();
    writer.close();
  }
}
