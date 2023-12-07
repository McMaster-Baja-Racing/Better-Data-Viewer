package backend.API.analyzer;

import java.util.ArrayList;
import java.util.List;

import backend.API.readwrite.Reader;
import backend.API.readwrite.CSVReader;
import backend.API.readwrite.Writer;
import backend.API.readwrite.CSVWriter;

public class LinearInterpolaterAnalyzer extends Analyzer {

    public LinearInterpolaterAnalyzer(String[] inputFiles, String[] inputColumns, String[] outputFiles) {
        super(inputFiles, inputColumns, outputFiles);
    }

    @Override
    public void analyze() {
        System.out.println("Interpolating \"" + inputFiles[0] + "\" and \"" + inputFiles[1] + "\" to \"" + outputFiles[0] + "\"");

        // Begin timer
        long startTime = System.nanoTime();

        Reader r1 = new CSVReader(inputFiles[0]);
        Reader r2 = new CSVReader(inputFiles[1]);
        Writer w = new CSVWriter(outputFiles[0]);

        w.write(linearInterpolate(r1.read(), r2.read()));

        // End timer
        long endTime = System.nanoTime();

        System.out.println("Interpolation took " + (endTime - startTime) / 1000000 + " milliseconds");

    }
    
    // Interpolate data2 to data1
    public List<List<String>> linearInterpolate(List<List<String>> data1, List<List<String>> data2) {

        List<List<String>> dataPoints = new ArrayList<List<String>>();
        List<String> dataPoint = new ArrayList<String>(2);

        // We're assuming that both series will have their independent variables in the same column(probably 0), so just one independentColumn variable
        int independentColumn = this.getAnalysisColumnIndex(0, data1.get(0));
        // Which column in data2 contains the variable we're adding to data1
        int dependentColumn2 = this.getAnalysisColumnIndex(1, data2.get(0));

        // Add header
        // We're appending data 2 to ALL columns of data1, not just the one we selected
        for (int col = 0; col < data1.get(0).size(); col++) {
            dataPoint.add(data1.get(0).get(col));
        }
        dataPoint.add(data2.get(0).get(dependentColumn2));
        dataPoints.add(dataPoint);

        // Reset
        dataPoint = new ArrayList<String>(2);

        // Starting from 2 to skip header and have 2 data points for interpolation
        int i = 2;
        int j = 2;

        while (i < data1.size() && j < data2.size()) {
            // Add all columns of data1
            for (int col = 0; col < data1.get(0).size(); col++) {
                dataPoint.add(data1.get(i).get(col));
            }

            // Find the closest data point in data1
            Double targetTime = Double.parseDouble(data1.get(i).get(independentColumn));
            Double secondaryTime = Double.parseDouble(data2.get(j).get(independentColumn));

            // Find the closest data point in data2
            while (targetTime > secondaryTime && j < data2.size() - 1) {
                j++;
                secondaryTime = Double.parseDouble(data2.get(j).get(independentColumn));
            }

            // Interpolate math
            double x1 = Double.parseDouble(data2.get(j - 1).get(independentColumn));
            double x2 = Double.parseDouble(data2.get(j).get(independentColumn));
            double y1 = Double.parseDouble(data2.get(j - 1).get(dependentColumn2));
            double y2 = Double.parseDouble(data2.get(j).get(dependentColumn2));
            double x = Double.parseDouble(data1.get(i).get(independentColumn));

            double y =  ((y2 - y1) / (x2 - x1)) * (x - x1) + y1;
            dataPoint.add(Double.toString(y));

            dataPoints.add(dataPoint);
            dataPoint = new ArrayList<String>(2);

            i++;
        }

        return dataPoints;
    }

    public static void main(String[] args) {
        String[] inputFiles = {"X:/Code/Projects/Baja/Better-Data-Viewer/API/upload-dir/151408/GPS LONGITUDE.csv", "X:/Code/Projects/Baja/Better-Data-Viewer/API/upload-dir/151408/GPS LATITUDE.csv"
        };
        String[] outputFiles = {"X:/Code/Projects/Baja/Better-Data-Viewer/data/temp2.csv"};
        String[] inputColumns = {"GPS LONGITUDE", "GPS LATITUDE"};

        LinearInterpolaterAnalyzer analyzer = new LinearInterpolaterAnalyzer(inputFiles, inputColumns, outputFiles);
        analyzer.analyze();
    }
    
}
