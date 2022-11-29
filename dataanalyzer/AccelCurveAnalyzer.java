package dataanalyzer;

import storage.Reader;
import storage.csv.CSVReader;

import java.util.List;
import java.util.ArrayList;

public class AccelCurveAnalyzer extends DataAnalyzer {
    private List<List<String>>[] preparedData;
    
    public AccelCurveAnalyzer(List<List<String>>[] data) {
        super(data);
    }

    // This was the first attempt, but should be moved to prepareData method an optimized heavily
    // Analyze will be used to sort the data afterwards, so only accel curves are gotten instead of deccel curves
    public List<List<String>> analyze() { // Where data[0] is excel for Primary and data[1] is excel for Secondary
        // Primary has both Timestamp (ms) and F_RPM_PRIM, Secondary has both Timestamp (ms) and F_GPS_SPEED
        // We need to find one time in the shorter file, then linearly interpolate the other file to that time
        // Then we can compare the two values at that time and add it to the list of data points, in the form of (F_RPM_PRIM, F_GPS_SPEED)
        // Then we can repeat this process for the rest of the data points in the shorter file

        //Initialize variables
        List<List<String>> dataPoints = new ArrayList<List<String>>();
        List<String> dataPoint = new ArrayList<String>();

        //Find shorter file
        List<List<String>> shorterFile;
        List<List<String>> longerFile;

        if (data[0].size() < data[1].size()) {
            shorterFile = data[0];
            longerFile = data[1];
        } else {
            shorterFile = data[1];
            longerFile = data[0];
        }

        //Begin loop
        for (int i = 43000; i < 45000; i++) {
            //Find time in shorter file
            int time = Integer.parseInt(shorterFile.get(i).get(0));

            //Use linear interpolation to find value in longer file
            int index = 1;
            int currTime;
            int nextTime = Integer.parseInt(longerFile.get(index).get(0));
            double val = 0;

            for (index = 1; index < longerFile.size() - 1; index++) {
                currTime = nextTime;
                nextTime = Integer.parseInt(longerFile.get(index + 1).get(0));
                if (currTime == time) {
                    val = Double.parseDouble(longerFile.get(index).get(1));
                    break; // Found the time
                }
                else if (currTime < time && time < nextTime) {
                    // Found the closest times, do the interpolation
                    double currVal = Double.parseDouble(longerFile.get(index).get(1));
                    double nextVal = Double.parseDouble(longerFile.get(index + 1).get(1));

                    double slope = (nextVal - currVal) / (nextTime - currTime);
                    val = currVal + slope * (time - currTime);
                    break;
                }
                //TODO: edge case when it is done
            }

            //Find values at that time
            String value1 = shorterFile.get(i).get(1);
            String value2 = Double.toString(val);

            //Add values to dataPoint
            dataPoint.add(value1);
            dataPoint.add(value2);

            //Add dataPoint to dataPoints
            dataPoints.add(dataPoint);

            //Reset dataPoint
            dataPoint = new ArrayList<String>();
        }

        return dataPoints;
    }

    public List<List<String>> prepareData() {
        // Taking the two files, run through and interpolate them to the same time
        return null;
    }


    static public void main(String[] args) {
        //test the above code
        Reader readerPrim = new CSVReader("data/F_RPM_PRIM.csv");
        Reader readerSec = new CSVReader("data/F_GPS_SPEED.csv");

        List<List<String>>[] data = new List[2];
        data[0] = readerPrim.read();
        data[1] = readerSec.read();

        System.out.println("Here");

        AccelCurveAnalyzer analyzer = new AccelCurveAnalyzer(data);
        List<List<String>> dataPoints = analyzer.analyze();

        for (int i = 0; i < dataPoints.size(); i++) {
            System.out.println(dataPoints.get(i).get(0) + ", " + dataPoints.get(i).get(1));
        }

    }

}
