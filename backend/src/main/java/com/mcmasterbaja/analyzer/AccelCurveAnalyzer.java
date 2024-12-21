// package com.mcmasterbaja.analyzer;

// import com.mcmasterbaja.model.AnalyzerParams;
// import com.opencsv.exceptions.CsvException;
// import jakarta.enterprise.context.RequestScoped;
// import jakarta.inject.Inject;
// import java.io.BufferedWriter;
// import java.io.File;
// import java.io.FileWriter;
// import java.io.IOException;
// import java.util.ArrayList;
// import java.util.Arrays;
// import java.util.List;
// import org.jboss.logging.Logger;

// @RequestScoped
// public class AccelCurveAnalyzer extends Analyzer {

//   @Inject Logger logger;
//   @Inject AnalyzerParams params;

//   // inputFiles are first primary RPM, then secondary RPM
//   // outputFiles are first primary RPM rolling average, then secondary RPM rolling average, then
//   // interpolated, then accel curve (runs)
//   @Inject
//   public AccelCurveAnalyzer(String[] inputFiles, String[] inputColumns, String[] outputFiles) {
//     super(inputFiles, inputColumns, outputFiles);
//   }

//   @Override
//   public void analyze() throws IOException, CsvException {
//     logger.info("Combining \"" + inputFiles[0] + "\" and \"" + inputFiles[1] + "\"");
//     logger.info("sGolay Averaging...");

//     String[] inputFiles = params.getInputFiles();
//     String[] inputColumns = params.getInputColumns();
//     String[] outputFiles = params.getOutputFiles();

//     SGolayFilter s =
//         new SGolayFilter(
//             Arrays.copyOfRange(inputFiles, 0, 1),
//             new String[] {"Timestamp (ms)", inputColumns[0]},
//             Arrays.copyOfRange(outputFiles, 0, 1),
//             300,
//             3);
//     s.analyze();
//     SGolayFilter s2 =
//         new SGolayFilter(
//             Arrays.copyOfRange(inputFiles, 1, 2),
//             new String[] {"Timestamp (ms)", inputColumns[1]},
//             Arrays.copyOfRange(outputFiles, 1, 2),
//             300,
//             3);
//     s2.analyze();

//     logger.info("Interpolating...");

//     InterpolaterProAnalyzer linearInterpolate =
//         new InterpolaterProAnalyzer(
//             Arrays.copyOfRange(outputFiles, 0, 2),
//             new String[] {"Timestamp (ms)", inputColumns[0], inputColumns[1]},
//             Arrays.copyOfRange(outputFiles, 2, 3));
//     linearInterpolate.analyze();
//   }

//   // Gets start and end timestamps of accel runs based on GPS speed
//   @Deprecated
//   public static List<List<Integer>> getAccelTimestamp(List<List<String>> dataPoints) {
//     int initialTime = 0;
//     int endTime = 0;
//     float next = 0;
//     float curr;
//     boolean inAccel = false;
//     List<List<Integer>> timestamp = new ArrayList<List<Integer>>();

//     for (int i = 15; i < dataPoints.size() - 15; i++) {
//       curr = Float.parseFloat(dataPoints.get(i).get(2));
//       if (curr >= 35 && !inAccel) {
//         inAccel = true;
//         next = Float.parseFloat(dataPoints.get(i).get(2));
//         while (next >= curr && i < dataPoints.size() - 1) {
//           i++;
//           curr = next;
//           next = Float.parseFloat(dataPoints.get(i).get(2));

//           endTime = Integer.parseInt(dataPoints.get(i).get(0));
//         }

//         int j = i;
//         while (curr > 2.5 && j > 1) {
//           j--;
//           curr = Float.parseFloat(dataPoints.get(j).get(2));
//         }
//         initialTime = Integer.parseInt(dataPoints.get(j).get(0));

//         timestamp.add(Arrays.asList(initialTime, endTime));

//       } else if (inAccel) {
//         while (curr > 2.5 && i < dataPoints.size() - 2) {
//           i++;
//           curr = Float.parseFloat(dataPoints.get(i).get(2));
//         }
//         inAccel = false;
//       }
//     }
//     return timestamp;
//   }

//   // This could maybe be rewritten
//   @Deprecated
//   public static void timestampToCSV(List<List<Integer>> accelTimes, List<List<String>> dataPoints)
//       throws IOException {
//     // print to separate csv, will be removed if/when frontend can go to specified
//     // points
//     FileWriter fw2 = new FileWriter("./upload-dir/combinedAccel.csv");
//     BufferedWriter bw2 = new BufferedWriter(fw2);
//     bw2.write("Timestamp (ms),F_PRIM_RPM,F_GPS_SPEED\n");

//     for (int i = 0; i < accelTimes.size(); i++) {
//       int initialTime = accelTimes.get(i).get(0);
//       int endTime = accelTimes.get(i).get(1);
//       String fileName = "./upload-dir/run" + i + ".csv";
//       File file = new File(fileName);
//       if (!file.exists()) {
//         file.createNewFile();
//       }
//       FileWriter fw = new FileWriter(file.getAbsoluteFile());

//       BufferedWriter bw = new BufferedWriter(fw);

//       bw.write("Timestamp (ms),F_PRIM_RPM,F_GPS_SPEED\n");

//       for (int j = 1; j < dataPoints.size(); j++) {
//         int currTime = Integer.parseInt(dataPoints.get(j).get(0));
//         if (currTime >= initialTime && currTime <= endTime) {
//           bw.write(
//               dataPoints.get(j).get(0)
//                   + ","
//                   + dataPoints.get(j).get(1)
//                   + ","
//                   + dataPoints.get(j).get(2)
//                   + "\n");
//           bw2.write(
//               dataPoints.get(j).get(0)
//                   + ","
//                   + dataPoints.get(j).get(1)
//                   + ","
//                   + dataPoints.get(j).get(2)
//                   + "\n");
//         }
//       }
//       bw.close();
//     }
//     bw2.close();
//   }

//   // my mother is a fish
// }
