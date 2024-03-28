package backend.API.analyzer;

import backend.API.readwrite.CSVReader;
import backend.API.readwrite.CSVWriter;
import backend.API.readwrite.Reader;
import backend.API.readwrite.Writer;

import java.util.ArrayList;
import java.util.List;


public class BullshitAnalyzer extends Analyzer {

    // The point of this analyuzer is to add a bunch of fake points based on an input, between
    // different pre-existing points (input file) to make it seem like there is some fake noise

    private double numPoints;

    // This is the constructor for the BullshitAnalyzer class
    public BullshitAnalyzer(String[] inputFiles, String[] inputColumns, String[] outputFiles,
            double numPoints) {
        super(inputFiles, inputColumns, outputFiles);
        this.numPoints = numPoints;
    }

    // This is the analyze method for the BullshitAnalyzer class
    public void analyze() {
        System.out.println("Adding " + numPoints + " fake points to " + super.inputFiles[0] + " to " + super.outputFiles[0]);

        // This is the reader for the input file
        Reader r = new CSVReader(super.inputFiles[0]);
        // This is the writer for the output file
        Writer w = new CSVWriter(super.outputFiles[0]);

        // This is the list of data points
        List<List<String>> dataPoints = new ArrayList<List<String>>();
        // This is the list of data points for the output file
        List<List<String>> outputDataPoints = new ArrayList<List<String>>();

        // This is the list of data points for the input file
        dataPoints = r.read();

        // This is the list of data points for the output file


        outputDataPoints = addFakePoints(dataPoints, numPoints);

        // This is the list of data points for the output file
        w.write(outputDataPoints);
    }

    //Add fake points should add the number points between each point in the input file
    // It should be a random +- 10% of the difference between the two points, linearly intwerpolated with even spacing on the x axis
    //Idea is to loop through, basically using the equation for linear interpolation (find slope), then find value at that slope 
    // and then add a random +- 10% of that value to the point
    // This is the addFakePoints method for the BullshitAnalyzer class
    public List<List<String>> addFakePoints(List<List<String>> dataPoints, double numPoints) {
        List<List<String>> outputData = new ArrayList<List<String>>();

        int independentColumn = this.getAnalysisColumnIndex(0, dataPoints.get(0));
        int dependentColumn = this.getAnalysisColumnIndex(1, dataPoints.get(0));

        // Add the headers for our independent variable (x axis, e.g. Timestamp (ms)) and the column
        // we're bullshitting, ignore the other columns
        List<String> headerRow = new ArrayList<String>();
        headerRow.add(dataPoints.get(0).get(independentColumn));
        headerRow.add(dataPoints.get(0).get(dependentColumn));

        outputData.add(headerRow);

        List<String> dataPoint = new ArrayList<String>(2);

        // Loop through each point
        for (int i = 1; i < dataPoints.size() - 1; i++) {
            // Add the current point to the output data
            // outputData.add(dataPoints.get(i));

            List<String> currPoint = dataPoints.get(i);
            List<String> nextPoint = dataPoints.get(i + 1);

            Double currX = Double.parseDouble(currPoint.get(independentColumn));
            Double currY = Double.parseDouble(currPoint.get(dependentColumn));
            Double nextX = Double.parseDouble(nextPoint.get(independentColumn));
            Double nextY = Double.parseDouble(nextPoint.get(dependentColumn));

            // print all pf them
            System.out.println(
                    "Points are: (" + currX + "," + currY + "), (" + nextX + "," + nextY + ")");

            // the amount of times numPoints is should deppend on the difference between the two
            // points x values
            // and the number of points
            double realNumPoints = Math.abs(nextX - currX) * numPoints;
            System.out.println("numPoints: " + realNumPoints);
            //Then, for numPoints number of times, add a fake point
            for (int j = 0; j < realNumPoints; j++) {

                dataPoint = new ArrayList<String>(2);

                // add x value (c1 + diff * interval)
                Double xValue = currX + ((nextX - currX) * (1.0 / realNumPoints) * j);

                System.out.println("xValue: " + xValue + "   with diff of : "
                        + (nextX - currX) * (1.0 / realNumPoints));
                dataPoint.add(Double.toString(xValue));

                // add y value
                Double slope = (nextY - currY) / (nextX - currX);
                Double yValue = currY + (xValue - currX) * slope;
                dataPoint.add(Double.toString(yValue * (0.75 + Math.random() * 0.5)));

                //print it
                //System.out.println(dataPoint.get(0) + " " + dataPoint.get(1));

                outputData.add(dataPoint);
            }
        }

        return outputData;

    }


    //Create a main to test it
    public static void main(String[] args) {
        // // Test the factory method
        // System.out.println("Hello");
        // String[] inputFiles = {"X:/Code/Projects/Baja/Better-Data-Viewer/data/test.csv"};
        // String[] outputFiles = {"output.csv"};
        // // now make a bullshit analyzer without createAnalyzer
        // BullshitAnalyzer bs = new BullshitAnalyzer(inputFiles, outputFiles, 10);

        // bs.analyze();

        // // Now test AccelCurveAnalyzer
    }

}
