package backend.API.analyzer;

import java.io.IOException;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;


public abstract class Analyzer {
    
    // Input and output files are arrays because some analyzers may need multiple input files
    protected String[] inputFiles;
    protected String[] outputFiles;

    public Analyzer(String[] inputFiles, String[] outputFiles) {
        this.inputFiles = inputFiles;
        this.outputFiles = outputFiles;
    }
    
    // Abstract method to be implemented by subclasses
    public abstract void analyze();

    // I/O methods
    // Streams as they avoid loading the entire file into memory at once
    protected BufferedReader getReader(String inputFile) throws IOException {
        return new BufferedReader(new FileReader(inputFile));
    }

    protected BufferedWriter getWriter(String outputFile) throws IOException {
        return new BufferedWriter(new FileWriter(outputFile));
    }

    // Factory method allows creation of different types of analyzers without having to change the code that calls it
    // When a new analyzer is created, add it to this factory method
    public static Analyzer createAnalyzer(String type, String[] inputFiles, String[] outputFiles, Object... params) {
        switch (type) {
            case "accelCurve":
                //return new AccelCurveAnalyzer(inputFiles, outputFiles);
            case "rollingAvg":
                int windowSize = (int) params[0];
                return new RollingAvgAnalyzer(inputFiles, outputFiles, windowSize);
            case "linearInterpolate":
                return new LinearInterpolateAnalyzer(inputFiles, outputFiles);
            default:
                return null;
        }
    }

    public static void main(String[] args) {
        // Test the factory method
        System.out.println("Hello");
        String[] inputFiles = {"C:\\Users\\Ariel\\OneDrive\\Documents\\GitHub\\Better-Data-Viewer\\API\\upload-dir\\F_RPM_PRIM.csv"};
        String[] outputFiles = {"output.csv"};
        Analyzer.createAnalyzer("rollingAvg", inputFiles, outputFiles, 30).analyze();
    }

}