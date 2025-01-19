package com.mcmasterbaja.analyzer;

import com.mcmasterbaja.annotations.OnAnalyzerException;
import com.mcmasterbaja.model.AnalyzerParams;
import com.mcmasterbaja.model.AnalyzerType;
import jakarta.enterprise.context.Dependent;
import jakarta.inject.Inject;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import lombok.SneakyThrows;
import org.jboss.logging.Logger;

@Dependent
@AnalyzerQualifier(AnalyzerType.ACCEL_CURVE)
@OnAnalyzerException
public class AccelCurveAnalyzer extends Analyzer {

  @Inject Logger logger;
  @Inject AnalyzerParams params;
  @Inject AnalyzerFactory analyzerFactory;

  // inputFiles are first primary RPM, then secondary RPM
  // outputFiles are first primary RPM rolling average, then secondary RPM rolling average, then
  // interpolated, then accel curve (runs)
  @Override
  @SneakyThrows
  public void analyze(AnalyzerParams params) {
    extractParams(params);
    // We don't want to use the default output filenames because we call other analyzers inside this one
    this.outputFiles = new String[3];
    logger.info("Combining \"" + inputFiles[0] + "\" and \"" + inputFiles[1] + "\"");
    logger.info("sGolay Averaging...");

    Analyzer golayer = analyzerFactory.getAnalyzer(AnalyzerType.SGOLAY);
    AnalyzerParams golayParams = new AnalyzerParams();
    golayParams.setType(AnalyzerType.SGOLAY);
    golayParams.setInputFiles(Arrays.copyOfRange(inputFiles, 0, 1));
    golayParams.setInputColumns(new String[] {"Timestamp (ms)", inputColumns[0]});
    // golayParams.setOutputFiles(Arrays.copyOfRange(outputFiles, 0, 1));
    golayParams.generateOutputFileNames();
    this.outputFiles[0] = golayParams.getOutputFiles()[0];
    golayParams.setOptions(new String[] {"300", "3"});
    golayer.analyze(golayParams);

    Analyzer golayer2 = analyzerFactory.getAnalyzer(AnalyzerType.SGOLAY);
    AnalyzerParams golayParams2 = new AnalyzerParams();
    golayParams2.setType(AnalyzerType.SGOLAY);
    golayParams2.setInputFiles(Arrays.copyOfRange(inputFiles, 1, 2));
    golayParams2.setInputColumns(new String[] {"Timestamp (ms)", inputColumns[1]});
    // golayParams2.setOutputFiles(Arrays.copyOfRange(outputFiles, 1, 2));
    golayParams2.generateOutputFileNames();
    this.outputFiles[1] = golayParams2.getOutputFiles()[0];
    golayParams2.setOptions(new String[] {"300", "3"});
    golayer2.analyze(golayParams2);

    logger.info("Interpolating...");

    Analyzer interpolater = analyzerFactory.getAnalyzer(AnalyzerType.INTERPOLATER_PRO);
    AnalyzerParams interpolateParams = new AnalyzerParams();
    interpolateParams.setType(AnalyzerType.INTERPOLATER_PRO);
    interpolateParams.setInputFiles(Arrays.copyOfRange(outputFiles, 0, 2));
    interpolateParams.setInputColumns(
        new String[] {inputColumns[0], inputColumns[1]});
    // interpolateParams.setOutputFiles(Arrays.copyOfRange(outputFiles, 2, 3));
    interpolateParams.generateOutputFileNames();
    // The final output of the accel curve analyzer is the interpolater output
    this.outputFiles[2] = interpolateParams.getOutputFiles()[0];
    interpolater.analyze(interpolateParams);

    logger.info("Done");
  }

  /**
   * We run two intermediate analyzers so we want to send back the last output file
   */
  @Override
  public String getOutputFilename() {
    return outputFiles[2];
  } 

  // Gets start and end timestamps of accel runs based on GPS speed
  @Deprecated
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
  @Deprecated
  public static void timestampToCSV(List<List<Integer>> accelTimes, List<List<String>> dataPoints)
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
}
