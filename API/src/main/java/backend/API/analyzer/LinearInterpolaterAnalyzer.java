package backend.API.analyzer;

import java.util.ArrayList;
import java.util.List;

import backend.API.readwrite.Reader;
import backend.API.readwrite.CSVReader;
import backend.API.readwrite.Writer;
import backend.API.readwrite.CSVWriter;

public class LinearInterpolaterAnalyzer extends Analyzer {

    public LinearInterpolaterAnalyzer(String[] inputFiles, String[] outputFiles) {
        super(inputFiles, outputFiles);
    }

    @Override
    public void analyze() {
        System.out.println("Interpolating \"" + inputFiles[0] + "\" and \"" + inputFiles[1] + "\"");

        Reader r1 = new CSVReader(inputFiles[0]);
        Reader r2 = new CSVReader(inputFiles[1]);
        Writer w = new CSVWriter(outputFiles[0]);

        w.write(linearInterpolate(r1.read(), r2.read()));

    }
    // Interpolate data2 to data1
    public List<List<String>> linearInterpolate(List<List<String>> data1, List<List<String>> data2) {

        List<List<String>> dataPoints = new ArrayList<List<String>>();
        List<String> dataPoint = new ArrayList<String>(2);

        // Add header
        dataPoint.add(data1.get(0).get(0));
        dataPoint.add(data1.get(0).get(1));
        dataPoint.add(data2.get(0).get(1));
        dataPoints.add(dataPoint);

        // Reset
        dataPoint = new ArrayList<String>(2);

        // Starting from 2 to skip header and have 2 data points for interpolation
        int i = 2;
        int j = 2;

        while (i < data1.size() && j < data2.size()) {
            dataPoint.add(data1.get(i).get(0)); // Add timestamp
            dataPoint.add(data1.get(i).get(1)); // Add data1 value

            // Find the closest data point in data1
            Double targetTime = Double.parseDouble(data1.get(i).get(0));
            Double secondaryTime = Double.parseDouble(data2.get(j).get(0));

            // Find the closest data point in data2
            while (targetTime > secondaryTime && j < data2.size() - 1) {
                j++;
                secondaryTime = Double.parseDouble(data2.get(j).get(0));
            }

            // Interpolate math
            double x1 = Double.parseDouble(data2.get(j - 1).get(0));
            double x2 = Double.parseDouble(data2.get(j).get(0));
            double y1 = Double.parseDouble(data2.get(j - 1).get(1));
            double y2 = Double.parseDouble(data2.get(j).get(1));
            double x = Double.parseDouble(data1.get(i).get(0));

            double y =  ((y2 - y1) / (x2 - x1)) * (x - x1) + y1;
            dataPoint.add(Double.toString(y));

            dataPoints.add(dataPoint);
            dataPoint = new ArrayList<String>(2);

            i++;
        }

        return dataPoints;
    }


    // main test code
    public static void main(String[] args) {
        String[] filepaths = new String[2];
        filepaths[0] = "X:/Code/Projects/Baja/Better-Data-Viewer/API/upload-dir/live_F_RPM_PRIM.csv";
        filepaths[1] = "X:/Code/Projects/Baja/Better-Data-Viewer/API/upload-dir/live_F_RPM_SEC.csv";

        RollingAvgAnalyzer r1 = new RollingAvgAnalyzer(filepaths, filepaths, 30);
        r1.analyze();

        filepaths[1] = "X:/Code/Projects/Baja/Better-Data-Viewer/API/upload-dir/live_F_RPM_PRIM.csv";
        filepaths[0] = "X:/Code/Projects/Baja/Better-Data-Viewer/API/upload-dir/live_F_RPM_SEC.csv";

        RollingAvgAnalyzer r2 = new RollingAvgAnalyzer(filepaths, filepaths, 30);
        r2.analyze();

        filepaths[0] = "X:/Code/Projects/Baja/Better-Data-Viewer/API/upload-dir/live_F_RPM_PRIM.csv_averaged.csv";
        filepaths[1] = "X:/Code/Projects/Baja/Better-Data-Viewer/API/upload-dir/live_F_RPM_SEC.csv_averaged.csv";

        LinearInterpolaterAnalyzer l = new LinearInterpolaterAnalyzer(filepaths, filepaths);
        l.analyze();
    }
    
}
