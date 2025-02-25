package com.mcmasterbaja.analyzer;

import com.mcmasterbaja.annotations.OnAnalyzerException;
import com.mcmasterbaja.exceptions.InvalidHeaderException;
import com.mcmasterbaja.model.AnalyzerParams;
import com.mcmasterbaja.model.AnalyzerType;
import jakarta.enterprise.context.Dependent;
import jakarta.inject.Inject;
import java.util.LinkedList;
import java.util.Queue;
import lombok.SneakyThrows;
import org.jboss.logging.Logger;

@Dependent
@AnalyzerQualifier(AnalyzerType.ROLL_AVG)
@OnAnalyzerException
public class RollingAvgAnalyzer extends Analyzer {
  private int windowSize;
  @Inject Logger logger;

  @Override
  @SneakyThrows
  public void analyze(AnalyzerParams params) {
    extractParams(params);
    this.windowSize =
        Integer.parseInt(params.getOptions()[0]) > 0
            ? Integer.parseInt(params.getOptions()[0])
            : 30;

    logger.info(
        "Taking the rolling average of "
            + super.inputFiles[0]
            + " to "
            + super.outputFiles[0]
            + " with a window size of "
            + windowSize);

    getReader(
        inputFiles[0],
        reader -> {
          getWriter(
              outputFiles[0],
              writer -> {
                String[] headers = safeReadNext(reader);
                if (headers == null) {
                  throw new InvalidHeaderException(
                      "Failed to read headers from input file: " + inputFiles[0]);
                }

                int xAxisIndex = this.getColumnIndex(inputColumns[0], headers);
                int yAxisIndex = this.getColumnIndex(inputColumns[1], headers);
                writer.writeNext(headers);

                // Queues are used here to keep track of the window of data as we read line by
                // line
                // Timestamps only track half of the window so that when we write data, we write
                // it in the
                // middle (looking forward and backwards)
                Queue<Double> window = new LinkedList<Double>();
                Queue<String> timestamps = new LinkedList<String>();
                double rollSum = 0;
                String[] dataPoint;

                while ((dataPoint = safeReadNext(reader)) != null) {
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
              });
        });
  }
}
