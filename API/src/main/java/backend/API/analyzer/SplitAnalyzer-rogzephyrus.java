package backend.API.analyzer;

import backend.API.readwrite.CSVReader;
import backend.API.readwrite.CSVWriter;
import backend.API.readwrite.Reader;
import backend.API.readwrite.Writer;
import java.util.ArrayList;
import java.util.List;

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

    Reader r = new CSVReader(super.inputFiles[0]);
    Writer w = new CSVWriter(super.outputFiles[0]);

    w.write(split(r.read(), start, end));
  }

  // IMPLEMENT WITH BINARAY SEARCH
  // WILL SPEED UP A TON

  // split data from start to end and return the data
  public List<List<String>> split(List<List<String>> data, int start, int end) {

    List<List<String>> dataPoints = new ArrayList<List<String>>();
    List<String> dataPoint = new ArrayList<String>(2);

    int independentColumn = this.getAnalysisColumnIndex(0, data.get(0));
    int dependentColumn = this.getAnalysisColumnIndex(1, data.get(0));

    // Add header
    dataPoint.add(data.get(0).get(independentColumn));
    dataPoint.add(data.get(0).get(dependentColumn));
    dataPoints.add(dataPoint);

    dataPoint = new ArrayList<String>(2);
    // loop through the data and add the date from once the start time is reached to the end time is
    // reached, the first colomn is the timestamp
    for (int i = 1; i < data.size(); i++) {
      if (Integer.parseInt(data.get(i).get(independentColumn)) >= start
          && Integer.parseInt(data.get(i).get(independentColumn)) <= end) {
        dataPoint.add(data.get(i).get(independentColumn));
        dataPoint.add(data.get(i).get(dependentColumn));
        dataPoints.add(dataPoint);
        dataPoint = new ArrayList<String>(2);
      }
    }

    return dataPoints;
  }

  // make a main to test it
  public static void main(String[] args) {
    // String[] filepaths = new String[1];
    // String[] outputFiles = new String[1];
    // filepaths[0] =
    // "C:/Users/Ariel/OneDrive/Documents/dev/Better-Data-Viewer/API/upload-dir/F_RPM_PRIM.csv";
    // outputFiles[0] =
    // "C:/Users/Ariel/OneDrive/Documents/dev/Better-Data-Viewer/API/upload-dir/F_RPM_PRIM_split.csv";
    // SplitAnalyzer r = new SplitAnalyzer(filepaths, outputFiles, 7749475, 7749619);
    // r.analyze();
  }
}
