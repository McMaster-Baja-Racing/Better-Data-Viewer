package com.mcmasterbaja.analyzer;

import com.opencsv.CSVReader;
import com.opencsv.ICSVWriter;
import com.opencsv.exceptions.CsvException;
import java.io.IOException;
import java.util.LinkedList;
import java.util.Queue;

public class RollingAvgAnalyzer extends Analyzer {
  private final int windowSize;

  public RollingAvgAnalyzer(
      String[] inputFiles, String[] inputColumns, String[] outputFiles, int windowSize) {
    super(inputFiles, inputColumns, outputFiles);
    this.windowSize = windowSize;
  }

  public RollingAvgAnalyzer(String[] inputFiles, String[] inputColumns, String[] outputFiles) {
    super(inputFiles, inputColumns, outputFiles);
    this.windowSize = 30;
  }

  @Override
  public void analyze() throws IOException, CsvException {

    System.out.println(
        "Taking the rolling average of "
            + super.inputFiles[0]
            + " to "
            + super.outputFiles[0]
            + " with a window size of "
            + windowSize);

    CSVReader reader = getReader(inputFiles[0]);
    ICSVWriter writer = getWriter(outputFiles[0]);

    String[] headers = reader.readNext();
    int xAxisIndex = this.getColumnIndex(inputColumns[0], headers);
    int yAxisIndex = this.getColumnIndex(inputColumns[1], headers);
    writer.writeNext(headers);

    double rollSum = 0;
    String[] dataPoint;
    Queue<Double> window = new LinkedList<Double>();

    while ((dataPoint = reader.readNext()) != null) {
      rollSum += Double.parseDouble(dataPoint[yAxisIndex]);
      window.add(Double.parseDouble(dataPoint[yAxisIndex]));
      String y;
      if (reader.getLinesRead() <= windowSize) {
        y = Double.toString(rollSum / reader.getLinesRead());
      } else {
        rollSum -= window.remove();
        y = Double.toString(rollSum / windowSize);
      }
      String x = dataPoint[xAxisIndex];
      writer.writeNext(new String[] {x, y});
    }

    writer.close();
  }
}
