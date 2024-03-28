package backend.API.analyzer;

// Shouldn't need this
import backend.API.readwrite.CSVReader;
import backend.API.readwrite.Reader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class AccelCurveAnalyzer extends Analyzer {

  // inputFiles are first primary RPM, then secondary RPM
  // outputFiles are first primary RPM rolling average, then secondary RPM rolling average, then
  // interpolated, then accel curve (runs)
  public AccelCurveAnalyzer(String[] inputFiles, String[] inputColumns, String[] outputFiles) {
    super(inputFiles, inputColumns, outputFiles);
  }

  @Override
  public void analyze() {
    System.out.println("Combining \"" + inputFiles[0] + "\" and \"" + inputFiles[1] + "\"");
    // Roll average first
    System.out.println("sGolay Averaging...");

    // SGolay filtering with Timestamp as independent variable, but we didn't actually select
    // Timestamp as an axis in the front-end so we hardcode it in here
    SavitskyGolayFilter s =
        new SavitskyGolayFilter(
            Arrays.copyOfRange(inputFiles, 0, 1),
            new String[] {"Timestamp (ms)", inputColumns[0]},
            Arrays.copyOfRange(outputFiles, 0, 1),
            300,
            3);
    s.analyze();
    SavitskyGolayFilter s2 =
        new SavitskyGolayFilter(
            Arrays.copyOfRange(inputFiles, 1, 2),
            new String[] {"Timestamp (ms)", inputColumns[1]},
            Arrays.copyOfRange(outputFiles, 1, 2),
            300,
            3);
    s2.analyze();

    // RollingAvgAnalyzer rollingAvg1 = new RollingAvgAnalyzer(Arrays.copyOfRange(inputFiles, 0, 1),
    // Arrays.copyOfRange(outputFiles, 0, 1), 30);
    // rollingAvg1.analyze();
    // RollingAvgAnalyzer rollingAvg2 = new RollingAvgAnalyzer(Arrays.copyOfRange(inputFiles, 1, 2),
    // Arrays.copyOfRange(outputFiles, 1, 2), 30);
    // rollingAvg2.analyze();

    // Then interpolate
    System.out.println("Interpolating...");

    // LinearInterp with Timestamp as independent variable, but we didn't actually select Timestamp
    // as an axis in the front-end so we hardcode it in here
    LinearInterpolaterAnalyzer linearInterpolate =
        new LinearInterpolaterAnalyzer(
            Arrays.copyOfRange(outputFiles, 0, 2),
            new String[] {"Timestamp (ms)", inputColumns[0], inputColumns[1]},
            Arrays.copyOfRange(outputFiles, 2, 3));
    linearInterpolate.analyze();

    // LinearInterpolaterAnalyzer linearInt = new
    // LinearInterpolaterAnalyzer(Arrays.copyOfRange(outputFiles, 0, 2),
    // Arrays.copyOfRange(outputFiles, 2, 3));
    // linearInt.analyze();

    // Here is all the analyzing done for combining the files, the rest concerns
    // finding individual runs

    // This all was to also write the data to a separate file, but it had the same data as the
    // original file, so unnecessary for now
    // String path = System.getProperty("user.dir");
    // String output = path + "/upload-dir/accelCurve.csv"; // This is bad for concurrency

    Reader reader = new CSVReader(outputFiles[2]);
    List<List<String>> dataPoints = reader.read();

    // Writer writer = new CSVWriter(outputFiles[2]);
    // writer.write(dataPoints);

    List<List<Integer>> accelTimes = getAccelTimestamp(dataPoints);
    for (int i = 0; i < accelTimes.size(); i++) {
      System.out.println(accelTimes.get(i));
    }
    try {
      timestampToCsv(accelTimes, dataPoints);
    } catch (IOException e) {
      e.printStackTrace();
    }

    String[] files = new String[accelTimes.size()];
    for (int i = 0; i < accelTimes.size(); i++) {
      files[i] = "./data/run" + i + ".csv";
    }
  }

  // Outdated
  // Currently it uses a sliding window + interpolation to get the dataRPM, and
  // further uses a rolling average on the longer file
  public List<List<String>> interpolateAndRollAverage(
      List<List<String>> longerFile, List<List<String>> shorterFile) {

    List<List<String>> dataPoints = new ArrayList<List<String>>();
    List<String> dataPoint = new ArrayList<String>(3);

    // Add the first data point
    dataPoint = new ArrayList<String>(longerFile.get(0));
    dataPoint.add(shorterFile.get(0).get(1));
    dataPoints.add(dataPoint);

    // Reset
    dataPoint = new ArrayList<String>(3);

    // Average the first 30 lines of the longer file to get the initial RPM
    double rollSum = 0;

    int indexShort = 2;
    // Begin loop
    int limit = longerFile.size();
    for (int i = 2; i < limit; i++) {
      // Find time in longer file
      int timeLong = Integer.parseInt(longerFile.get(i).get(0));

      // Find time in shorter file
      int timeShort = Integer.parseInt(shorterFile.get(indexShort).get(0));

      // Find the closest time in the shorter file
      while (timeLong >= timeShort) {
        indexShort++;
        // Catch out of bounds
        if (indexShort >= shorterFile.size()) {
          indexShort--;
          break;
        }
        timeShort = Integer.parseInt(shorterFile.get(indexShort).get(0));
      } // Keep going until you have a time that is greater than the time in the longer
      // file

      // Create new datapoint that lines up with the longer file via linear
      // interpolation
      // Dynamic rolling average
      dataPoint.add(longerFile.get(i).get(0)); // Add time

      rollSum += Double.parseDouble(longerFile.get(i).get(1));
      if (i < 12) {
        dataPoint.add(Double.toString(rollSum / i));
      } else {
        rollSum -= Double.parseDouble(longerFile.get(i - 10).get(1));
        dataPoint.add(Double.toString(rollSum / 10));
      }

      // Already added the x value

      // Using data at indexOfShorterFile and indexOfShorterFile - 1, interpolate the
      // value
      double val1 = Double.parseDouble(shorterFile.get(indexShort - 1).get(1));
      double val2 = Double.parseDouble(shorterFile.get(indexShort).get(1));
      double time1 = Double.parseDouble(shorterFile.get(indexShort - 1).get(0));
      double time2 = Double.parseDouble(shorterFile.get(indexShort).get(0));

      double slope = (val2 - val1) / (time2 - time1);
      String val = Double.toString(slope * (timeLong - time1) + val1);
      dataPoint.add(val); // Add y

      // Add dataPoint to dataPoints
      dataPoints.add(dataPoint);

      // Reset dataPoint
      dataPoint = new ArrayList<String>(3);
    }

    return dataPoints;
  }

  // Gets start and end timestamps of accel runs based on GPS speed
  public static List<List<Integer>> getAccelTimestamp(List<List<String>> dataPoints) {
    int initialTime = 0;
    int endTime = 0;
    float next = 0;
    float curr;
    boolean inAccel = false;
    List<List<Integer>> timestamp = new ArrayList<List<Integer>>();

    for (int i = 15; i < dataPoints.size() - 15; i++) {
      curr = Float.parseFloat(dataPoints.get(i).get(2));
      if (curr >= 35 && !inAccel) {
        inAccel = true;
        next = Float.parseFloat(dataPoints.get(i).get(2));
        while (next >= curr && i < dataPoints.size() - 1) {
          i++;
          curr = next;
          next = Float.parseFloat(dataPoints.get(i).get(2));

          endTime = Integer.parseInt(dataPoints.get(i).get(0));
        }

        int j = i;
        while (curr > 2.5 && j > 1) {
          j--;
          curr = Float.parseFloat(dataPoints.get(j).get(2));
        }
        initialTime = Integer.parseInt(dataPoints.get(j).get(0));

        timestamp.add(Arrays.asList(initialTime, endTime));

      } else if (inAccel) {
        while (curr > 2.5 && i < dataPoints.size() - 2) {
          i++;
          curr = Float.parseFloat(dataPoints.get(i).get(2));
        }
        inAccel = false;
      }
    }
    return timestamp;
  }

  // This could maybe be rewritten
  public static void timestampToCsv(List<List<Integer>> accelTimes, List<List<String>> dataPoints)
      throws IOException {
    // print to separate csv, will be removed if/when frontend can go to specified
    // points
    FileWriter fw2 = new FileWriter("./upload-dir/combinedAccel.csv");
    BufferedWriter bw2 = new BufferedWriter(fw2);
    bw2.write("Timestamp (ms),F_PRIM_RPM,F_GPS_SPEED\n");

    for (int i = 0; i < accelTimes.size(); i++) {
      int initialTime = accelTimes.get(i).get(0);
      int endTime = accelTimes.get(i).get(1);
      String fileName = "./upload-dir/run" + i + ".csv";
      File file = new File(fileName);
      if (!file.exists()) {
        file.createNewFile();
      }
      FileWriter fw = new FileWriter(file.getAbsoluteFile());

      BufferedWriter bw = new BufferedWriter(fw);

      bw.write("Timestamp (ms),F_PRIM_RPM,F_GPS_SPEED\n");

      for (int j = 1; j < dataPoints.size(); j++) {
        int currTime = Integer.parseInt(dataPoints.get(j).get(0));
        if (currTime >= initialTime && currTime <= endTime) {
          bw.write(
              dataPoints.get(j).get(0)
                  + ","
                  + dataPoints.get(j).get(1)
                  + ","
                  + dataPoints.get(j).get(2)
                  + "\n");
          bw2.write(
              dataPoints.get(j).get(0)
                  + ","
                  + dataPoints.get(j).get(1)
                  + ","
                  + dataPoints.get(j).get(2)
                  + "\n");
        }
      }
      bw.close();
    }
    bw2.close();
  }

  // my mother is a fish

  public static void main(String[] args) {
    // //This will test the accelCurve analyzer

    // //Read in the data
    // Date start = new Date();

    // String[] files = new String[2];
    // files[0] = "C:/Users/Admin/Documents/GitHub/Better-Data-Viewer/data/live_F_RPM_PRIM.csv";
    // files[1] = "C:/Users/Admin/Documents/GitHub/Better-Data-Viewer/data/live_F_RPM_SEC.csv";

    // String[] output = new String[3];
    // output[0] = "prim_roll.csv";
    // output[1] = "sec_roll.csv";
    // output[2] = "accelCurve.csv";

    // //run the accelCurve analyzer
    // AccelCurveAnalyzer accelCurve = new AccelCurveAnalyzer(files, output);
    // accelCurve.analyze();

    // System.out.println("Done");

    // Date end = new Date();
    // System.out.println("Time: " + (end.getTime() - start.getTime()) + "ms");
  }
}
