package com.mcmasterbaja.analyzer;

import java.util.List;

import org.jboss.logging.Logger;

import com.mcmasterbaja.annotations.OnAnalyzerException;
import com.mcmasterbaja.model.AnalyzerParams;
import com.mcmasterbaja.model.AnalyzerType;
import com.opencsv.CSVReader;
import com.opencsv.ICSVWriter;

import jakarta.enterprise.context.Dependent;
import jakarta.inject.Inject;
import lombok.SneakyThrows;

@Dependent
@AnalyzerQualifier(AnalyzerType.AVERAGE)
@OnAnalyzerException
public class AverageAnalyzer extends Analyzer {
  // This class takes the average of a range of a column and returns it as a
  // double
  @Inject
  Logger logger;

  @SneakyThrows
  public void analyze(AnalyzerParams params) {
    int[] range = new int[2];
    range[0] = Integer.parseInt((String) params.getOptions()[0]);
    range[1] = Integer.parseInt((String) params.getOptions()[1]);

    logger.info(
        "Taking the average of "
            + params.getInputFiles()[0]
            + " to "
            + params.getOutputFiles()[0]
            + " with a range of "
            + range[0]
            + " to "
            + range[1]);

    getReader(
        params.getInputFiles()[0],
        reader -> {
          getWriter(
              params.getOutputFiles()[0],
              writer -> {
                averageIO(reader, writer, range);
              });
        });
  }

  @SneakyThrows
  public void averageIO(CSVReader reader, ICSVWriter writer, int[] range) {
    String[] headers = { "TempColumn", "Average" };
    writer.writeNext(headers);

    reader.readNext(); // Skip headers
    String[] dataPoint = { "0", Double.toString(average(reader.readAll(), range[0], range[1])) };
    writer.writeNext(dataPoint);

    logger.info("Average: " + dataPoint[1]);
  }

  // Takes average at found indices of second column
  public double average(List<String[]> data, int start, int end) {
    int startIndex = binarySearch(data, start);
    int endIndex = binarySearch(data, end);

    double sum = 0;
    for (int i = startIndex; i <= endIndex; i++) {
      sum += Double.parseDouble(data.get(i)[1]);
    }
    return sum / (endIndex - startIndex + 1);
  }

  // Binary search finds index relative to first column. It should find the
  // closest value
  public int binarySearch(List<String[]> data, int target) {
    int low = 0;
    int high = data.size() - 1;
    int mid = (low + high) / 2;

    while (low <= high) {
      mid = (low + high) / 2;
      if (Integer.parseInt(data.get(mid)[0]) == target) {
        return mid;
      } else if (Integer.parseInt(data.get(mid)[0]) < target) {
        low = mid + 1;
      } else if (Integer.parseInt(data.get(mid)[0]) > target) {
        high = mid - 1;
      }
    }
    return mid;
  }
}
