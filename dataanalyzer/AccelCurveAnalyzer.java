package dataanalyzer;

//import a way to time the program
import java.io.IOException;
import java.util.Arrays;
import java.util.Date;

import storage.Reader;
import storage.csv.CSVReader;

import java.io.FileWriter;
import java.util.List;
import java.util.ArrayList;

public class AccelCurveAnalyzer extends DataAnalyzer {
    private List<List<String>> preparedData;
    
    public AccelCurveAnalyzer(List<List<String>>[] data) {
        super(data);
    }

    // This was the first attempt, but should be moved to prepareData method an optimized heavily
    // Analyze will be used to sort the data afterwards, so only accel curves are gotten instead of deccel curves

    // Currently it uses a sliding window + interpolation to get the dataRPM
    public List<List<String>> analyze() { 
        // WAYS TO IMPROVE: Indexing of second file instead of looping through it every time (O(n^2) -> O(2n)) (I just did this :) )
        //                  Implement binary search based on ratio of files (HARD) (O(2n) -> O(n))

        // Initialize variables
        List<List<String>> dataPoints = new ArrayList<List<String>>();
        List<String> dataPoint = new ArrayList<String>(3);

        List<List<String>> shorterFile;
        List<List<String>> longerFile;

        // Find the longer file
        if (data[0].size() > data[1].size()) {
            shorterFile = data[1];
            longerFile = data[0];
        } else {
            shorterFile = data[0];
            longerFile = data[1];
        }

        //Average the first 30 lines of the longer file to get the initial RPM
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
                
            } // Keep going until you have a time that is greater than the time in the longer file

            // Create new datapoint that lines up with the longer file via linear interpolation
            dataPoint.add(longerFile.get(i).get(0)); // Add time
            dataPoint.add(Double.toString(rollSum / 30)); // Add x
            // Using data at indexOfShorterFile and indexOfShorterFile - 1, interpolate the value
            
            double val1 = Double.parseDouble(shorterFile.get(indexShort - 1).get(1));
            double val2 = Double.parseDouble(shorterFile.get(indexShort).get(1));
            double time1 = Double.parseDouble(shorterFile.get(indexShort - 1).get(0));
            double time2 = Double.parseDouble(shorterFile.get(indexShort).get(0));
            //System.out.println("time1: " + time1 + " time2: " + time2 + " timeLong: " + timeLong);

            double slope = (val2 - val1) / (time2 - time1);
            String val = Double.toString(slope * (timeLong - time1) + val1);
            dataPoint.add(val); // Add y

            //Add dataPoint to dataPoints
            dataPoints.add(dataPoint);

            //Reset dataPoint
            dataPoint = new ArrayList<String>(2);
        }

        return dataPoints;
    }

    public List<List<String>> prepareData() {
        // Taking the two files, run through and interpolate them to the same time
        return null;
    }

    //gets start and end timestamps of accel runs based on GPS speed
     public static List<List<Integer>> getAccelTimestamp(List<List<String>> dataPoints) {
        float rollingAv = 0;
        int initialTime = 0;
        int endTime = 0;
        float next = 0;
        float curr;
        boolean inAccel = false;
        List<List<Integer>> timestamp = new ArrayList<List<Integer>>();
        /*
         for (int j = 0; j < 31; j++) {
             rollingAv += Float.parseFloat(dataPoints.get(j).get(1));
         }
         rollingAv/=31;*/

        for (int i = 15; i < dataPoints.size() - 15; i++) {
            curr = Float.parseFloat(dataPoints.get(i).get(2));
            if(curr >= 35 && !inAccel) {
                inAccel = true;
                next = Float.parseFloat(dataPoints.get(i).get(2));
                while(next>=curr) {
                    i++;
                    curr = next;
                    next = Float.parseFloat(dataPoints.get(i).get(2));

                    endTime = Integer.parseInt(dataPoints.get(i+100).get(0));
                }

                int j = i;
                while (curr > 2.5) {
                    j--;
                    curr = Float.parseFloat(dataPoints.get(j).get(2));
                }
                initialTime = Integer.parseInt(dataPoints.get(j-100).get(0));

                timestamp.add(Arrays.asList(initialTime, endTime));

            } else if (inAccel) {
                while (curr > 2.5) {
                    i++;
                    curr = Float.parseFloat(dataPoints.get(i).get(2));
                }
                inAccel = false;
            }


            /*rollingAv -= Float.parseFloat(dataPoints.get(i-15).get(1))/31;
            rollingAv += Float.parseFloat(dataPoints.get(i+15).get(1))/31;

            for (int j = i; j < 30 + i; j++) {
                rollingAv += Float.parseFloat(dataPoints.get(i).get(1));
            }
            rollingAv/=30;*/

        }
        return timestamp;
     }

     public static void timestampToCSV(List<List<Integer>> accelTimes, List<List<String>> dataPoints) throws IOException {
         //print to separate csv, will be removed if/when frontend can go to specified points
         for (int j = 0; j < accelTimes.size(); j++) {
             FileWriter w = new FileWriter("./data/run" + j + ".csv");
             for (int i = 0; i < dataPoints.size(); i++) {

                 int time = Integer.parseInt(dataPoints.get(i).get(0));
                 int accel[] = { accelTimes.get(j).get(0), accelTimes.get(j).get(1) };

                 if (time >= accel[0]) {
                     w.write(dataPoints.get(i).get(0) + "," + dataPoints.get(i).get(1) + "," + dataPoints.get(i).get(2) + "\n");
                     if (time > accel[1]) {
                         w.close();
                         break;
                     }
                 }
             }
         }
     }
    static public void main(String[] args) throws Exception {
        // time this
        Date start = new Date();
        //test the above code
        System.out.println("Combining " + args[0] + " and " + args[1]);
        Reader readerPrim = new CSVReader(args[0]);
        Reader readerSec = new CSVReader(args[1]);

        List<List<String>>[] data = new List[2];
        data[0] = readerPrim.read();
        data[1] = readerSec.read();

        System.out.println("Analysing Data");

        AccelCurveAnalyzer analyzer = new AccelCurveAnalyzer(data);
        List<List<String>> dataPoints = analyzer.analyze();

        
        FileWriter writer = new FileWriter("./data/interpolated.csv");
        for (int i = 0; i < dataPoints.size(); i++) {
            writer.write(dataPoints.get(i).get(0) + "," + dataPoints.get(i).get(1) + "," + dataPoints.get(i).get(2) + "\n");
        }
        writer.close();
        System.out.println("Done writing interpolated file");

        //print accel curve timestamps
        List<List<Integer>> accelTimes = getAccelTimestamp(dataPoints);
        for (int i = 0; i < accelTimes.size(); i++) {
            System.out.println(accelTimes.get(i));
        }

        //temporary
        timestampToCSV(accelTimes, dataPoints);

        System.out.println("Done");
        // time this
        Date end = new Date();
        System.out.println("Time: " + (end.getTime() - start.getTime()) + "ms");
    }
}
