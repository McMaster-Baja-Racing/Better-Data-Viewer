package dataanalyzer;

//import a way to time the program
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

        int indexShort = 1;
        // Begin loop
        int limit = longerFile.size();
        for (int i = 1; i < limit; i++) {
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
            dataPoint.add(longerFile.get(i).get(1)); // Add x
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

    static public void main(String[] args) throws Exception {
        // time this
        Date start = new Date();
        //test the above code
        Reader readerPrim = new CSVReader("data/F_RPM_PRIM.csv");
        Reader readerSec = new CSVReader("data/F_GPS_SPEED.csv");

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

        System.out.println("Done");
        // time this
        Date end = new Date();
        System.out.println("Time: " + (end.getTime() - start.getTime()) + "ms");
    }
}
