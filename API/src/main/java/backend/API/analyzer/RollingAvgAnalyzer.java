package backend.API.analyzer;

import backend.API.readwrite.CSVReader;
import backend.API.readwrite.CSVWriter;
import backend.API.readwrite.Reader;
import backend.API.readwrite.Writer;
import java.util.ArrayList;
import java.util.List;

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
  public void analyze() {

    System.out.println(
        "Taking the rolling average of "
            + super.inputFiles[0]
            + " to "
            + super.outputFiles[0]
            + " with a window size of "
            + windowSize);

    Reader r = new CSVReader(super.inputFiles[0]);
    Writer w = new CSVWriter(super.outputFiles[0]);

    w.write(rollingAverage(r.read(), windowSize));
  }

  // Currently it uses a sliding window
  public List<List<String>> rollingAverage(List<List<String>> data, int windowSize) {

    double rollSum = 0;

    List<List<String>> dataPoints = new ArrayList<List<String>>();
    List<String> dataPoint = new ArrayList<String>(2);

    int independentColumn = this.getAnalysisColumnIndex(0, data.get(0));
    int dependentColumn = this.getAnalysisColumnIndex(1, data.get(0));

    // Add header
    dataPoint.add(data.get(0).get(independentColumn));
    dataPoint.add(data.get(0).get(dependentColumn));
    dataPoints.add(dataPoint);

    // Reset
    dataPoint = new ArrayList<String>(2);

    for (int i = 1; i < data.size(); i++) {
      dataPoint.add(data.get(i).get(independentColumn)); // Add timestamp

      rollSum += Double.parseDouble(data.get(i).get(dependentColumn));
      if (i <= windowSize) {
        // Round this double to 2 decimal places
        dataPoint.add(Double.toString(Math.round((rollSum / i) * 100.0) / 100.0));
      } else {
        rollSum -= Double.parseDouble(data.get(i - windowSize).get(dependentColumn));
        dataPoint.add(Double.toString(Math.round((rollSum / windowSize) * 100.0) / 100.0));
      }

      dataPoints.add(dataPoint);
      dataPoint = new ArrayList<String>(2);
    }

    return dataPoints;
  }

  // make a main to test it
  public static void main(String[] args) {
    // String[] filepaths = new String[1];
    // filepaths[0] =
    // "C:/Users/Ariel/OneDrive/Documents/GitHub/Better-Data-Viewer/API/upload-dir/F_RPM_PRIM.csv";
    // RollingAvgAnalyzer r = new RollingAvgAnalyzer(filepaths, filepaths, 30);
    // r.analyze();
  }
}
