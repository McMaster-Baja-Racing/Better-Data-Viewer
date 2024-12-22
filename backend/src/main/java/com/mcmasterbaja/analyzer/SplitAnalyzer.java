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
@AnalyzerType(AnalyzerEnum.SPLIT)
public class SplitAnalyzer extends Analyzer {
  private int start;
  private int end;

  @Inject Logger logger;

  @Override
  public void analyze(AnalyzerParams params) throws IOException, CsvException {
    extractParams(params);
    this.start = Integer.parseInt(params.getOptions()[0]);
    this.end = Integer.parseInt(params.getOptions()[1]);

    logger.info(
        "Spliting the file named"
            + super.inputFiles[0]
            + " to "
            + super.outputFiles[0]
            + " with a startingt timestamp of "
            + start
            + " and an ending timestamp of "
            + end);

    CSVReader reader = getReader(inputFiles[0]);
    ICSVWriter writer = getWriter(outputFiles[0]);

    String[] headers = reader.readNext();
    int columnIndex = this.getColumnIndex(inputColumns[0], headers);
    writer.writeNext(headers);

    String[] dataPoint;

    while ((dataPoint = reader.readNext()) != null) {
      if (Integer.parseInt(dataPoint[columnIndex]) >= end) {
        break;
      } else if (Integer.parseInt(dataPoint[columnIndex]) >= start) {
        writer.writeNext(dataPoint);
      }
    }

    reader.close();
    writer.close();
  }
}
