package com.mcmasterbaja.analyzer;

import com.mcmasterbaja.annotations.OnAnalyzerException;
import com.opencsv.CSVReader;
import com.opencsv.ICSVWriter;
import java.util.List;
import lombok.SneakyThrows;

@OnAnalyzerException
public class AverageAnalyzer extends Analyzer {
  // This class takes the average of a range of a column and returns it as a double
  private final int[] range;

  public AverageAnalyzer(String[] inputFiles, String[] outputFiles, int[] range) {
    super(inputFiles, outputFiles);
    // This range is the value, not the index. BinarySearch will be used to find the index
    this.range = range;
  }

  @SneakyThrows
  public void analyze() {
    System.out.println(
        "Taking the average of "
            + super.inputFiles[0]
            + " to "
            + super.outputFiles[0]
            + " with a range of "
            + range[0]
            + " to "
            + range[1]);

    CSVReader reader = getReader(super.inputFiles[0]);
    ICSVWriter writer = getWriter(super.outputFiles[0]);

    String[] headers = {"TempColumn", "Average"};
    writer.writeNext(headers);

    String[] dataPoint = {"0", Double.toString(average(reader.readAll(), range[0], range[1]))};
    writer.writeNext(dataPoint);
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

  // Binary search finds index relative to first column. It should find the closest value
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
