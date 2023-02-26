import javax.print.attribute.standard.Compression;

public class Compression_RDPAnalyzer extends Analyzer {

    // Epsilon is the maximum distance between a point and the line between the start and end points
    // AKA Hausdorff distance
    private double epsilon;

    public Compression_RDPAnalyzer(String[] inputFiles, String[] outputFiles, double epsilon) {
        super(inputFiles, outputFiles);
        this.epsilon = epsilon;
    }

    @Override
    public String analyze() {

        System.out.println("Compressing " + filepaths[0]);

        Reader r = new CSVReader(filepaths[0]);
        Writer w = new CSVWriter(filepaths[0] + "_compressed.csv");

        w.write(RamerDouglasPeucker(r.read(), epsilon));

        return filepaths[0] + "_compressed.csv";
    }

    public List<List<String>> RamerDouglasPeucker(List<List<String>> data, double epsilon) {

        List<List<String>> dataPoints = new ArrayList<List<String>>();
        List<String> dataPoint = new ArrayList<String>(2);

        // Add header
        dataPoint.add(data.get(0).get(0));
        dataPoint.add(data.get(0).get(1));
        dataPoints.add(dataPoint);

        // Reset
        dataPoint = new ArrayList<String>(2);

        // Add first and last point
        dataPoint.add(data.get(0).get(0));
        dataPoint.add(data.get(0).get(1));
        dataPoints.add(dataPoint);

        dataPoint = new ArrayList<String>(2);
        dataPoint.add(data.get(data.size() - 1).get(0));
        dataPoint.add(data.get(data.size() - 1).get(1));
        dataPoints.add(dataPoint);

        // Reset
        dataPoint = new ArrayList<String>(2);

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
            List<List<String>> firstHalf = data.subList(0, maxIndex + 1);
            List<List<String>> secondHalf = data.subList(maxIndex, data.size());

            List<List<String>> firstHalfCompressed = RamerDouglasPeucker(firstHalf, epsilon);
            List<List<String>> secondHalfCompressed = RamerDouglasPeucker(secondHalf, epsilon);

            // Remove the last point of the first half and the first point of the second half
            firstHalfCompressed.remove(firstHalfCompressed.size() - 1);
            secondHalfCompressed.remove(0);

            // Concatenate the two halves
            firstHalfCompressed.addAll(secondHalfCompressed);
            dataPoints.addAll(firstHalfCompressed);
        }

        return dataPoints;
    }
    
}
