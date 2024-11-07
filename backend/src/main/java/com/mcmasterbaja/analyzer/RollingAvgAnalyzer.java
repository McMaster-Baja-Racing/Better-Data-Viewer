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
    if (windowSize <= 1) {
      throw new IllegalArgumentException("Window size must be greater than 1");
    }
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
    Queue<String> timestamps = new LinkedList<String>();

    while ((dataPoint = reader.readNext()) != null) {
      rollSum += Double.parseDouble(dataPoint[yAxisIndex]);
      timestamps.add(dataPoint[xAxisIndex]);
      window.add(Double.parseDouble(dataPoint[yAxisIndex]));

      String x, y;

      if (window.size() == windowSize) {
        y = Double.toString(rollSum / windowSize);
        x = timestamps.remove();
        writer.writeNext(new String[] {x, y});
        rollSum -= window.remove();
      } else if (timestamps.size() == windowSize / 2) {
        // Remove extra timestamps before window is populated
        timestamps.remove();
      }
    }

    reader.close();
    writer.close();
  }
}
