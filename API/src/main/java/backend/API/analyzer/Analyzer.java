package backend.API.analyzer;

import java.io.IOException;
import java.util.List;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;


public abstract class Analyzer {
    
    // Input and output files are arrays because some analyzers may need multiple input files
    protected String[] inputFiles;
    protected String[] inputColumns;
    protected String[] outputFiles;

    public Analyzer(String[] inputFiles, String[] inputColumns, String[] outputFiles) {
        this.inputFiles = inputFiles;
        // inputColumns is the names of the columns we are analyzing. index 0 is the independent variable (usually timestamp), 1+ are dependent variable(s)
        this.inputColumns = inputColumns;
        this.outputFiles = outputFiles;
    }

    // Some analyzers work on entire rows and don't need to select columns (e.g. compression), they should use this constructor
    public Analyzer(String[] inputFiles, String[] outputFiles) {
        this.inputFiles = inputFiles;
        this.inputColumns = new String[1];
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
    public static Analyzer createAnalyzer(String type, String[] inputFiles, String[] inputColumns, String[] outputFiles, Object... params) {
        // Before every input and output file location, add the storage directory before it
        for (int i = 0; i < inputFiles.length; i++) {
            inputFiles[i] = "./upload-dir/" + inputFiles[i];
        }
        for (int i = 0; i < outputFiles.length; i++) {
            outputFiles[i] = "./upload-dir/" + outputFiles[i];
        }
        switch (type) {
            case "accelCurve":
                if (outputFiles.length == 10) {
                    // Concept here is when no output files are provided to format automatically, the last one is always used as the final output
                    outputFiles[0] = inputFiles[0].substring(0, inputFiles[0].length() - 4) + "_roll.csv";
                    outputFiles[1] = inputFiles[1].substring(0, inputFiles[1].length() - 4) + "_roll.csv";
                    outputFiles[2] = inputFiles[0].substring(0, inputFiles[0].length() - 4) + "_inter_" + inputFiles[1].substring(13, inputFiles[1].length() - 4).replace("/", "") + ".csv";
                    outputFiles[9] = outputFiles[2];
                }
                return new AccelCurveAnalyzer(inputFiles, inputColumns, outputFiles);
            case "rollAvg":
                if (outputFiles.length == 10) {
                    outputFiles[0] = inputFiles[0].substring(0, inputFiles[0].length() - 4) + "_roll.csv";
                    outputFiles[9] = outputFiles[0];
                }
                // Check if passed a window size
                if (params.length == 0) {
                    return new RollingAvgAnalyzer(inputFiles, inputColumns, outputFiles);
                }
                int windowSize = Integer.parseInt((String) params[0]);
                return new RollingAvgAnalyzer(inputFiles, inputColumns, outputFiles, windowSize);
            case "sGolay":
                if (outputFiles.length == 10) {
                    outputFiles[0] = inputFiles[0].substring(0, inputFiles[0].length() - 4) + "_sgolay.csv";
                    outputFiles[9] = outputFiles[0];
                }
                // Check if passed a window size
                if (params.length == 0) {
                    return new SGolayFilter(inputFiles, inputColumns, outputFiles);
                }
                windowSize = Integer.parseInt((String) params[0]);
                int polynomialDegree = Integer.parseInt((String) params[1]);
                return new SGolayFilter(inputFiles, inputColumns, outputFiles, windowSize, polynomialDegree);
            case "linearInterpolate":
                if (outputFiles.length == 10) {
                    outputFiles[0] = inputFiles[0].substring(0, inputFiles[0].length() - 4) + "_inter_" + inputFiles[1].substring(13, inputFiles[1].length() - 4).replace("/", "") + ".csv";
                    outputFiles[9] = outputFiles[0];
                }
                // We use timestamp and inputColumns[1] as the inputColumns because we don't
                // actually care which column in the first file we're interpolating with, we'll just
                // add every column from the first file to the new file
                return new LinearInterpolaterAnalyzer(inputFiles,
                        new String[] {"Timestamp (ms)", inputColumns[1]}, outputFiles);
            case "RDPCompression":
                if (outputFiles.length == 10) {
                    outputFiles[0] = inputFiles[0].substring(0, inputFiles[0].length() - 4) + "_rdp.csv";
                    outputFiles[9] = outputFiles[0];
                }
                if (params.length == 0) {
                    return new RDPCompressionAnalyzer(inputFiles, outputFiles, 15);
                }
                double epsilon = Double.parseDouble((String) params[0]);
                return new RDPCompressionAnalyzer(inputFiles, outputFiles, epsilon);

                case "split":
                System.out.println("SplitAnalyzer");
                if (outputFiles.length == 10) {
                    outputFiles[0] = inputFiles[0].substring(0, inputFiles[0].length() - 4) + "_split.csv";
                    outputFiles[9] = outputFiles[0];
                }
                if ((String)params[1]=="" || (String)params[0]=="") {
                    return null;
                }
                int start = Integer.parseInt((String) params[0]);
                int end = Integer.parseInt((String) params[1]);
                return new SplitAnalyzer(inputFiles, inputColumns, outputFiles, start,end);
            case "linearMultiply":
                if (outputFiles.length == 10) {
                    outputFiles[0] = inputFiles[0].substring(0, inputFiles[0].length() - 4) + "_mult.csv";
                    outputFiles[9] = outputFiles[0];
                }
                if ((String)params[1]=="" || (String)params[0]=="") {
                    return null;
                }
                double m = Double.parseDouble((String) params[0]);
                double b = Double.parseDouble((String) params[1]);
                return new LinearMultiplyAnalyzer(inputFiles, inputColumns, outputFiles, m,b);

            case "average":
                if (outputFiles.length == 10) {
                    outputFiles[0] = inputFiles[0].substring(0, inputFiles[0].length() - 4) + "_avg.csv";
                    outputFiles[9] = outputFiles[0];
                }
                int[] range = new int[2];
                range[0] = Integer.parseInt((String) params[0]);
                range[1] = Integer.parseInt((String) params[1]);
                return new AverageAnalyzer(inputFiles, outputFiles, range);

            default:
                return null;
        }
    }

  
    // From this list of headers, which one are we actually doing analysis on
    // fileIndex is basically the axis, 0=X, 1=Y, I made it a int to futureproof adding new columns
    public int getAnalysisColumnIndex(int fileIndex, List<String> fileHeaders) throws RuntimeException {
        for(int i = 0; i < fileHeaders.size(); i++) {
            if(fileHeaders.get(i).trim().equals(this.inputColumns[fileIndex])) {
                return i;
            }
        }
        // The inputColum is wrong somehow, should never happen with working frontend
        throw new RuntimeException("No column in file exists with analysis column name");
    }

    public static void main(String[] args) {
        // Test the factory method
        // System.out.println("Hello");
        // String[] inputFiles = {"X:\\Code\\Projects\\Baja\\Better-Data-Viewer\\data\\live_F_RPM_PRIM.csv"};
        // String[] outputFiles = {"output.csv"};
        // Analyzer.createAnalyzer("rollingAvg", inputFiles, outputFiles, 30).analyze();

        // // Now test AccelCurveAnalyzer
        // String[] inputFiles2 = {"X:\\Code\\Projects\\Baja\\Better-Data-Viewer\\data\\live_F_RPM_PRIM.csv", "X:\\Code\\Projects\\Baja\\Better-Data-Viewer\\data\\live_F_RPM_SEC.csv"};
        // String[] outputFiles2 = {"prim_average.csv", "sec_average.csv", "interpolate.csv", "accel_curve.csv"};
        // Analyzer.createAnalyzer("accelCurve", inputFiles2, outputFiles2).analyze();
        // System.out.println("Hello");

        // String[] inputFiles3 = {"X:/Code/Projects/Baja/Better-Data-Viewer/data/temp.csv"};
        // String[] outputFiles3 = {"X:/Code/Projects/Baja/Better-Data-Viewer/data/temp2.csv"};
        // System.out.println("Hello");

        // String[] range = new String[2];
        // range[0] = "0";
        // range[1] = "100";

        // Analyzer.createAnalyzer("average", inputFiles3, outputFiles3, range).analyze();
    }

}