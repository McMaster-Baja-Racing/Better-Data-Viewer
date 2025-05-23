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
@AnalyzerQualifier(AnalyzerType.DELETE_OUTLIER)
@OnAnalyzerException
public class DeleteOutliers extends Analyzer {
  private double minimum;
  private double maximum;
  @Inject Logger logger;

  @SneakyThrows
  public void analyze(AnalyzerParams params) {
    extractParams(params);

    this.minimum = Double.parseDouble(params.getOptions()[0]);
    this.maximum = Double.parseDouble(params.getOptions()[1]);

    logger.info(
        "Deleting outliers from "
            + super.inputFiles[0]
            + " to "
            + super.outputFiles[0]
            + " with a min of "
            + this.minimum
            + " and a max of "
            + this.maximum);

    getReader(
        inputFiles[0],
        reader -> {
          getWriter(
              outputFiles[0],
              writer -> {
                deleteIO(reader, writer, inputColumns);
              });
        });
  }

  @SneakyThrows
  public void deleteIO(CSVReader reader, ICSVWriter writer, String[] inputColumns) {
    String[] headers = reader.readNext();
    if (headers == null) {
      throw new InvalidHeaderException("Failed to read headers from input file: " + inputFiles[0]);
    }

    logger.debug(inputColumns[0]);
    int xAxisIndex = this.getColumnIndex(inputColumns[1], headers);
    writer.writeNext(headers);

    String[] dataPoint;

    while ((dataPoint = reader.readNext()) != null) {
      if (this.minimum <= Double.parseDouble(dataPoint[xAxisIndex]) 
          && Double.parseDouble(dataPoint[xAxisIndex]) <= this.maximum) {
        writer.writeNext(dataPoint);
      }
    }
  }
}
