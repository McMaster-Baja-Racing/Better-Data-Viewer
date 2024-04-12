package backend.API.analyzer;

public class AnalyzerFactory {

    // Factory method allows creation of different types of analyzers without having
    // to change the
    // code that calls it
    // When a new analyzer is created, add it to this factory method
    public static Analyzer createAnalyzer(
            String type,
            String[] inputFiles,
            String[] inputColumns,
            String[] outputFiles,
            Object... params) {
                
        // Before every input and output file location, add the storage directory before
        // it
        switch (type) {
            case "accelCurve":
                if (outputFiles.length == 10) {
                    // Concept here is when no output files are provided to format automatically,
                    // the last one
                    // is always used as the final output
                    outputFiles[0] = inputFiles[0].substring(0, inputFiles[0].length() - 4) + "_roll.csv";
                    outputFiles[1] = inputFiles[1].substring(0, inputFiles[1].length() - 4) + "_roll.csv";
                    outputFiles[2] = inputFiles[0].substring(0, inputFiles[0].length() - 4)
                            + "_inter_"
                            + inputFiles[1].substring(13, inputFiles[1].length() - 4).replace("/", "")
                            + ".csv";
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
                return new SGolayFilter(
                        inputFiles, inputColumns, outputFiles, windowSize, polynomialDegree);
            case "linearInterpolate":
                if (outputFiles.length == 10) {
                    outputFiles[0] = inputFiles[0].substring(0, inputFiles[0].length() - 4)
                            + "_inter_"
                            + inputFiles[1].substring(13, inputFiles[1].length() - 4).replace("/", "")
                            + ".csv";
                    outputFiles[9] = outputFiles[0];
                }
                // We use timestamp and inputColumns[1] as the inputColumns because we don't
                // actually care which column in the first file we're interpolating with, we'll
                // just
                // add every column from the first file to the new file
                // Print all input columns
                return new LinearInterpolaterAnalyzer(
                        inputFiles, new String[] { "Timestamp (ms)", inputColumns[1] }, outputFiles);
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
                if (params[1] == "" || params[0] == "") {
                    return null;
                }
                int start = Integer.parseInt((String) params[0]);
                int end = Integer.parseInt((String) params[1]);
                return new SplitAnalyzer(inputFiles, inputColumns, outputFiles, start, end);
            case "linearMultiply":
                if (outputFiles.length == 10) {
                    outputFiles[0] = inputFiles[0].substring(0, inputFiles[0].length() - 4) + "_mult.csv";
                    outputFiles[9] = outputFiles[0];
                }
                if (params[1] == "" || params[0] == "") {
                    return null;
                }
                double m = Double.parseDouble((String) params[0]);
                double b = Double.parseDouble((String) params[1]);
                return new LinearMultiplyAnalyzer(inputFiles, inputColumns, outputFiles, m, b);

            case "average":
                if (outputFiles.length == 10) {
                    outputFiles[0] = inputFiles[0].substring(0, inputFiles[0].length() - 4) + "_avg.csv";
                    outputFiles[9] = outputFiles[0];
                }
                int[] range = new int[2];
                range[0] = Integer.parseInt((String) params[0]);
                range[1] = Integer.parseInt((String) params[1]);
                return new AverageAnalyzer(inputFiles, outputFiles, range);

            case "interpolaterPro":
                if (outputFiles.length == 10) {
                    // For each file, add to the output string
                    StringBuilder outputString = new StringBuilder(
                            inputFiles[0].substring(0, inputFiles[0].lastIndexOf("/") + 1));
                    for (String inputFile : inputFiles) {
                        outputString
                                .append(inputFile, inputFile.lastIndexOf("/") + 1, inputFile.length() - 4)
                                .append("_");
                    }
                    outputFiles[0] = outputString + "inter.csv";
                    outputFiles[9] = outputFiles[0];
                }
                return new InterpolaterProAnalyzer(inputFiles, inputColumns, outputFiles);
            case "cubic":
                if (outputFiles.length == 10) {
                    outputFiles[0] = inputFiles[0].substring(0, inputFiles[0].length() - 4) + "_cubic.csv";
                    outputFiles[9] = outputFiles[0];
                }
                double a = Double.parseDouble((String) params[0]);
                double b1 = Double.parseDouble((String) params[1]);
                double c = Double.parseDouble((String) params[2]);
                double d = Double.parseDouble((String) params[3]);
                return new CubicAnalyzer(inputFiles, inputColumns, outputFiles, a, b1, c, d);
            default:
                return null;
        }
    }


}