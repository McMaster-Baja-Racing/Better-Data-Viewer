package backend.API.analyzer;

//Shouldn't need this
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;

import java.util.Date;

import backend.API.readwrite.Reader;
import backend.API.readwrite.CSVReader;
import backend.API.readwrite.Writer;
import backend.API.readwrite.CSVWriter;

import java.util.List;
import java.util.ArrayList;
import java.io.IOException;
import java.util.Arrays;

public class AccelCurveAnalyzer extends DataAnalyzer {

    public AccelCurveAnalyzer(String[] filepaths) {
        super(filepaths);
    }

    @Override
    public String analyze() {
        System.out.println("Combining " + filepaths[0] + " and " + filepaths[1]);

        Reader readerPrim = new CSVReader(filepaths[0]);
        Reader readerSec = new CSVReader(filepaths[1]);

        System.out.println("Analysing Data");
        List<List<String>> dataPoints = InterpolateAndRollAverage(readerPrim.read(), readerSec.read()); // longerFile is
                                                                                                        // prim

        // Writing File
        System.out.println("Writing to file");
        String output = "data/accelCurve.csv";

        Writer writer = new CSVWriter(output);
        writer.write(dataPoints);

        List<List<Integer>> accelTimes = getAccelTimestamp(dataPoints);
        for (int i = 0; i < accelTimes.size(); i++) {
            System.out.println(accelTimes.get(i));
        }

        try {
            timestampToCSV(accelTimes, dataPoints);
        } catch (IOException e) {
            e.printStackTrace();
        }

        String[] files = new String[accelTimes.size()];
        for (int i = 0; i < accelTimes.size(); i++) {
            files[i] = "./data/run" + i + ".csv";
        }

        return output;
    }

    // Currently it uses a sliding window + interpolation to get the dataRPM, and
    // further uses a rolling average on the longer file
    public List<List<String>> InterpolateAndRollAverage(List<List<String>> longerFile, List<List<String>> shorterFile) {

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
        for (int i = 1; i <= 30; i++) {
            rollSum += Double.parseDouble(longerFile.get(i).get(1));
        }

        int indexShort = 1;
        // Begin loop
        int limit = longerFile.size();
        for (int i = 31; i < limit; i++) {
            // Rolling average stuff
            rollSum -= Double.parseDouble(longerFile.get(i - 30).get(1));
            rollSum += Double.parseDouble(longerFile.get(i).get(1));
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
            dataPoint.add(longerFile.get(i).get(0)); // Add time
            dataPoint.add(Double.toString(rollSum / 30)); // Add x
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
                while (next >= curr) {
                    i++;
                    curr = next;
                    next = Float.parseFloat(dataPoints.get(i).get(2));

                    endTime = Integer.parseInt(dataPoints.get(i).get(0));
                }

                int j = i;
                while (curr > 2.5) {
                    j--;
                    curr = Float.parseFloat(dataPoints.get(j).get(2));
                }
                initialTime = Integer.parseInt(dataPoints.get(j - 100).get(0));

                timestamp.add(Arrays.asList(initialTime, endTime));

            } else if (inAccel) {
                while (curr > 2.5) {
                    i++;
                    curr = Float.parseFloat(dataPoints.get(i).get(2));
                }
                inAccel = false;
            }

        }
        return timestamp;
    }

    // This could maybe be rewritten
    public static void timestampToCSV(List<List<Integer>> accelTimes, List<List<String>> dataPoints)
            throws IOException {
        // print to separate csv, will be removed if/when frontend can go to specified
        // points
        for (int i = 0; i < accelTimes.size(); i++) {
            int initialTime = accelTimes.get(i).get(0);
            int endTime = accelTimes.get(i).get(1);
            String fileName = "./data/run" + Integer.toString(i) + ".csv";
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
                    bw.write(dataPoints.get(j).get(0) + "," + dataPoints.get(j).get(1) + "," + dataPoints.get(j).get(2)
                            + "\n");
                }
            }
            bw.close();
        }
    }

    // my mother is a fish

    static public void main(String[] args) throws Exception {
        Date start = new Date();

        String[] files = new String[2];
        files[0] = "./data/F_RPM_PRIM.csv";
        files[1] = "./data/F_GPS_SPEED.csv";
        DataAnalyzer d = new AccelCurveAnalyzer(files);

        String dataPoints = d.analyze();
        System.out.println(dataPoints);

        Date end = new Date();
        System.out.println("Time: " + (end.getTime() - start.getTime()) + "ms");
    }
}
