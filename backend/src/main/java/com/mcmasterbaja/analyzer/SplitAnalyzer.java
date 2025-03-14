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
@AnalyzerQualifier(AnalyzerType.SPLIT)
@OnAnalyzerException
public class SplitAnalyzer extends Analyzer {
  private int start;
  private int end;

  @Inject Logger logger;

  @Override
  @SneakyThrows
  public void analyze(AnalyzerParams params) {
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

    getReader(
        inputFiles[0],
        reader -> {
          getWriter(
              outputFiles[0],
              writer -> {
                splitIO(null, null, inputColumns);
              });
        });
  }

  @SneakyThrows
  public void splitIO(CSVReader reader, ICSVWriter writer, String[] inputColumns) {
    String[] headers = reader.readNext();
    if (headers == null) {
      throw new InvalidHeaderException("Failed to read headers from input file: " + inputFiles[0]);
    }

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
  }
}
