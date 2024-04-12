package com.mcmasterbaja.analyzer;

import com.mcmasterbaja.model.AnalyzerParams;

public class AnalyzerFactory {

  public static Analyzer createAnalyzer(AnalyzerParams params) {
    
    String[] inputFiles = params.getInputFiles();
    String[] inputColumns = params.getInputColumns();
    String[] outputFiles = params.getOutputFiles();
    Object[] options = params.getOptions();

    switch (params.getType()) {
      case ACCEL_CURVE:
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
        return new SGolayFilter(
            inputFiles, inputColumns, outputFiles, windowSize, polynomialDegree);

      case LINEAR_INTERPOLATE:
        return new LinearInterpolaterAnalyzer(
            inputFiles, new String[] {"Timestamp (ms)", inputColumns[1]}, outputFiles);

      case RDP_COMPRESSION:
        if (options.length == 0) {
          return new RDPCompressionAnalyzer(inputFiles, outputFiles, 15);
        }
        double epsilon = Double.parseDouble((String) options[0]);
        return new RDPCompressionAnalyzer(inputFiles, outputFiles, epsilon);

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
