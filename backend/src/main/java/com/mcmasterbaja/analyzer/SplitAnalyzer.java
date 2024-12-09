package com.mcmasterbaja.analyzer;

import com.mcmasterbaja.annotations.OnAnalyzerException;
import com.mcmasterbaja.annotations.OnStorageException;
import com.mcmasterbaja.exceptions.InvalidHeaderException;
import com.opencsv.CSVReader;
import com.opencsv.ICSVWriter;
import lombok.SneakyThrows;

@OnAnalyzerException
@OnStorageException
public class SplitAnalyzer extends Analyzer {
  private final int start;
  private final int end;

  public SplitAnalyzer(
      String[] inputFiles, String[] inputColumns, String[] outputFiles, int start, int end) {
    super(inputFiles, inputColumns, outputFiles);
    this.start = start;
    this.end = end;
  }

  @Override
  @SneakyThrows
  public void analyze() {
    System.out.println(
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
    if (headers==null) { throw new InvalidHeaderException("Failed to read headers from input file: " + inputFiles[0]); }

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
