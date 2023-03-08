package backend.API.analyzer;

import backend.API.readwrite.CSVReader;
import backend.API.readwrite.CSVWriter;
import backend.API.readwrite.Reader;
import backend.API.readwrite.Writer;

import java.util.List;
import java.util.ArrayList;

public class RDPCompressionAnalyzer extends Analyzer {

    
    // Epsilon is the maximum distance between a point and the line between the start and end points
    // AKA Hausdorff distance
    private double epsilon;

    public RDPCompressionAnalyzer(String[] inputFiles, String[] outputFiles, double epsilon) {
        super(inputFiles, outputFiles);
        this.epsilon = epsilon;
    }

    @Override
    public void analyze() {

        System.out.println("Compressing " + inputFiles[0]);

        Reader r = new CSVReader(inputFiles[0]);
        Writer w = new CSVWriter(outputFiles[0]);

        List<List<String>> data = r.read();

        // Remove headers and store
        List<String> headers = data.get(0);
        data.remove(0);

        // Compress
        data = RamerDouglasPeucker(data, epsilon);

        // Add headers back
        data.add(0, headers);

        // Write
        w.write(data);
    }

    public List<List<String>> RamerDouglasPeucker(List<List<String>> data, double epsilon) {

        // Find the point with the maximum distance from the line between the first and last point
        double maxDistance = 0;
        int maxIndex = 0;
        for (int i = 1; i < data.size() - 1; i++) {
            double distance = perpendicularDistance(data.get(0), data.get(data.size() - 1), data.get(i));
            if (distance > maxDistance) {
                maxDistance = distance;
                maxIndex = i;
            }
        }

        // If the maximum distance is greater than epsilon, recursively simplify
        if (maxDistance > epsilon) {
            // Recursive call
            List<List<String>> firstLine = RamerDouglasPeucker(data.subList(0, maxIndex + 1), epsilon);
            List<List<String>> secondLine = RamerDouglasPeucker(data.subList(maxIndex, data.size()), epsilon);

            // Build the result list
            List<List<String>> result = new ArrayList<List<String>>();
            result.addAll(firstLine.subList(0, firstLine.size() - 1));
            result.addAll(secondLine);
            return result;
        } else {
            // Otherwise return the start and end points of the line
            return new ArrayList<List<String>>(List.of(data.get(0), data.get(data.size() - 1)));
        }
    }


    private double perpendicularDistance(List<String> lineStart, List<String> lineEnd, List<String> point) {
        double x1 = Double.parseDouble(lineStart.get(0));
        double y1 = Double.parseDouble(lineStart.get(1));
        double x2 = Double.parseDouble(lineEnd.get(0));
        double y2 = Double.parseDouble(lineEnd.get(1));
        double x0 = Double.parseDouble(point.get(0));
        double y0 = Double.parseDouble(point.get(1));

        return Math.abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1) / Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
    }


    // Set a main to test this
    public static void main(String[] args) {
        String[] inputFiles = new String[1];
        inputFiles[0] = "C:/Users/Admin/Documents/GitHub/Better-Data-Viewer/API/upload-dir/F_SUS_TRAV_FL_roll.csv";
        String[] outputFiles = new String[1];
        outputFiles[0] = "C:/Users/Admin/Documents/GitHub/Better-Data-Viewer/API/upload-dir/EWOOOOOOOOOOOOOOO.csv";
        RDPCompressionAnalyzer analyzer = new RDPCompressionAnalyzer(inputFiles, outputFiles,1);
        analyzer.analyze();
    }
}