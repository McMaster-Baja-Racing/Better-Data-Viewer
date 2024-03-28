package backend.API.analyzer;

import backend.API.readwrite.Reader;
import backend.API.readwrite.CSVReader;
import backend.API.readwrite.Writer;
import backend.API.readwrite.CSVWriter;

import java.util.ArrayList;
import java.util.List;

public class AverageAnalyzer extends Analyzer {
    // This class takes the average of a range of a column and returns it as a double
    private int[] range;

    public AverageAnalyzer(String[] inputFiles, String[] outputFiles, int[] range) {
        super(inputFiles, outputFiles);
        this.range = range; //This range is the value, not the index. BinarySearch will be used to find the index
    }

    public void analyze() {
        System.out.println("Taking the average of " + super.inputFiles[0] + " to " + super.outputFiles[0]
                + " with a range of " + range[0] + " to " + range[1]);

        Reader r = new CSVReader(super.inputFiles[0]);
        Writer w = new CSVWriter(super.outputFiles[0]);

        // Create a single data point with the average
        List<String> dataPoint = new ArrayList<String>(2);
        dataPoint.add("Temp");
        dataPoint.add("Average");

        // Add header
        List<List<String>> dataPoints = new ArrayList<List<String>>();
        dataPoints.add(dataPoint);

        // Reset
        dataPoint = new ArrayList<String>(2);

        // Add the average to the dataPoint
        dataPoint.add(Double.toString(0));
        dataPoint.add(Double.toString(average(r.read(), range[0], range[1])));

        // Add the dataPoint to the dataPoints
        dataPoints.add(dataPoint);

        w.write(dataPoints);
        
    }

    // Takes average at found indices of second column
    public double average(List<List<String>> data, int start, int end) {
        int startIndex = binarySearch(data, start);
        int endIndex = binarySearch(data, end);

        double sum = 0;
        for (int i = startIndex; i <= endIndex; i++) {
            sum += Double.parseDouble(data.get(i).get(1));
        }
        return sum / (endIndex - startIndex + 1);
    }

    // Binary search finds index relative to first column. It should find the closest value
    public int binarySearch(List<List<String>> data, int target) {
        int low = 0;
        int high = data.size() - 1;
        int mid = (low + high) / 2;

        while (low <= high) {
            mid = (low + high) / 2;
            if (Integer.parseInt(data.get(mid).get(0)) == target) {
                return mid;
            } else if (Integer.parseInt(data.get(mid).get(0)) < target) {
                low = mid + 1;
            } else if (Integer.parseInt(data.get(mid).get(0)) > target) {
                high = mid - 1;
            }
        }
        return mid;
    }

    //Make a main to test it
    public static void main(String[] args) {
        String[] inputFiles = {"X:/Code/Projects/Baja/Better-Data-Viewer/data/temp.csv"};
        String[] outputFiles = {"X:/Code/Projects/Baja/Better-Data-Viewer/data/temp2.csv"};
        int[] range = {51, 75};
        AverageAnalyzer a = new AverageAnalyzer(inputFiles, outputFiles, range);
        a.analyze();
    }

    

}