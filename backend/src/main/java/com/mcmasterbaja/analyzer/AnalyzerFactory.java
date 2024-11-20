package com.mcmasterbaja.analyzer;

import java.nio.file.Path;
import java.util.Arrays;
import com.mcmasterbaja.model.AnalyzerParams;
import com.mcmasterbaja.model.AnalyzerType;

public class AnalyzerFactory {


  /**
   * Default output file names, inputfile_type.csv. As many output files as input files.
   * 
   * @param inputFiles Array of input file names
   * @param type Analyzer type
   * @return Array of output file names
   */
  public static String[] defaultOutputFileNames(String[] inputFiles, AnalyzerType type) {
    String[] outputFiles = new String[inputFiles.length];
    for (int i = 0; i < inputFiles.length; i++) {
      if (type == null) {
        outputFiles[i] = inputFiles[i];
      } else {
        outputFiles[i] = inputFiles[i].replace(".csv", "_" + type.toString() + ".csv");
      }
    }
    return outputFiles;
  }

  public static Analyzer createAnalyzer(AnalyzerParams params) {

    String[] inputFiles = params.getInputFiles();
    String[] inputColumns = params.getInputColumns();
    String[] outputFiles = defaultOutputFileNames(inputFiles, params.getType());
    Object[] options = params.getOptions();

    switch (params.getType()) {
      case ACCEL_CURVE:
        // Accel curve creates two sgolay and one final output file, so add a new output file to the
        // list
        // We assume we want to put the output in the same folder as the 0th output file
        String outputFolderPath = Path.of(outputFiles[0]).getParent().toString();
        String finalOutputFilePath = Path.of(outputFolderPath, "ACCEL_CURVE.csv").toString();
        int N = outputFiles.length;
        outputFiles = Arrays.copyOf(outputFiles, N + 1);
        outputFiles[N] = finalOutputFilePath;
        return new AccelCurveAnalyzer(inputFiles, inputColumns, outputFiles);

      case ROLL_AVG:
        if (options.length == 0) {
          return new RollingAvgAnalyzer(inputFiles, inputColumns, outputFiles);
        }
        int windowSize = Integer.parseInt((String) options[0]);
        return new RollingAvgAnalyzer(inputFiles, inputColumns, outputFiles, windowSize);

      case SGOLAY:
        // Check if passed a window size
        if (options.length == 0) {
          return new SGolayFilter(inputFiles, inputColumns, outputFiles);
        }
        windowSize = Integer.parseInt((String) options[0]);
        int polynomialDegree = Integer.parseInt((String) options[1]);
        return new SGolayFilter(inputFiles, inputColumns, outputFiles, windowSize,
            polynomialDegree);

      case RDP_COMPRESSION:
        if (options.length == 0) {
          return new RDPCompressionAnalyzer(inputFiles, inputColumns, outputFiles, 15);
        }
        double epsilon = Double.parseDouble((String) options[0]);
        return new RDPCompressionAnalyzer(inputFiles, inputColumns, outputFiles, epsilon);

      case SPLIT:
        System.out.println("SplitAnalyzer");
        if (options[1] == "" || options[0] == "") {
          return null;
        }
        int start = Integer.parseInt((String) options[0]);
        int end = Integer.parseInt((String) options[1]);
        return new SplitAnalyzer(inputFiles, inputColumns, outputFiles, start, end);

      case LINEAR_MULTIPLY:
        if (options[1] == "" || options[0] == "") {
          return null;
        }
        double m = Double.parseDouble((String) options[0]);
        double b = Double.parseDouble((String) options[1]);
        return new LinearMultiplyAnalyzer(inputFiles, inputColumns, outputFiles, m, b);

      case CONSTANT_ADDER:
        if (options[3] == "" || options[2] == "" || options[1] == "" || options[0] == "") {
          return null;
        }
        double a1 = Double.parseDouble((String) options[0]);
        double b2 = Double.parseDouble((String) options[1]);
        double c1 = Double.parseDouble((String) options[2]);
        double d1 = Double.parseDouble((String) options[3]);
        return new ConstantAdderAnalyzer(inputFiles, inputColumns, outputFiles, a1, b2, c1, d1);

      case AVERAGE:
        int[] range = new int[2];
        range[0] = Integer.parseInt((String) options[0]);
        range[1] = Integer.parseInt((String) options[1]);
        return new AverageAnalyzer(inputFiles, outputFiles, range);

      case INTERPOLATER_PRO:
        return new InterpolaterProAnalyzer(inputFiles, inputColumns, outputFiles);

      case CUBIC:
        double a = Double.parseDouble((String) options[0]);
        double b1 = Double.parseDouble((String) options[1]);
        double c = Double.parseDouble((String) options[2]);
        double d = Double.parseDouble((String) options[3]);
        return new CubicAnalyzer(inputFiles, inputColumns, outputFiles, a, b1, c, d);
      default:
        return null;
    }
  }
}
