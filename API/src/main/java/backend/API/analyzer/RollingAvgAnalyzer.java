package backend.API.analyzer;

import java.util.ArrayList;
import java.util.List;

import backend.API.readwrite.Reader;
import backend.API.readwrite.CSVReader;
import backend.API.readwrite.Writer;
import backend.API.readwrite.CSVWriter;

public class RollingAvgAnalyzer extends DataAnalyzer {

    public RollingAvgAnalyzer(String[] filepaths) {
        super(filepaths);
    }

    @Override
    public String analyze() {

        Reader r = new CSVReader(filepaths[0]);
        Writer w = new CSVWriter(filepaths[0] + "_averaged.csv");

        w.write(rollingAverage(r.read(), 30));

        return filepaths[0] + "_averaged.csv";
    }


    // Currently it uses a sliding window 
    public List<List<String>> rollingAverage(List<List<String>> data, int windowSize) {

        double rollSum = 0;

        List<List<String>> dataPoints = new ArrayList<List<String>>();
        List<String> dataPoint = new ArrayList<String>(2);

        // Add header
        dataPoint.add(data.get(0).get(0));
        dataPoint.add("Rolling Averaged " + data.get(0).get(1));
        dataPoints.add(dataPoint);

        // Reset
        dataPoint = new ArrayList<String>(2);
        
        for (int i = 1; i < data.size(); i++) {
            dataPoint.add(data.get(i).get(0)); // Add timestamp

            rollSum += Double.parseDouble(data.get(i).get(1));
            if (i <= windowSize) {
                // Round this double to 2 decimal places
                dataPoint.add(Double.toString(Math.round((rollSum / i) * 100.0) / 100.0));
            } else {
                rollSum -= Double.parseDouble(data.get(i - windowSize).get(1));
                dataPoint.add(Double.toString(Math.round((rollSum / windowSize) * 100.0) / 100.0));
            }
            
            dataPoints.add(dataPoint);
            dataPoint = new ArrayList<String>(2);
        }

        return dataPoints;
    }

    // make a main to test it
    public static void main(String[] args) {
        String[] filepaths = new String[1];
        filepaths[0] = "C:/Users/Admin/Documents/GitHub/Better-Data-Viewer/API/upload-dir/F_RPM_PRIM.csv";
        RollingAvgAnalyzer r = new RollingAvgAnalyzer(filepaths);
        r.analyze();
    }
    
}
