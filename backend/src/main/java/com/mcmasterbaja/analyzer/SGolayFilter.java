package com.mcmasterbaja.analyzer;

import com.mcmasterbaja.readwrite.CSVReader;
import com.mcmasterbaja.readwrite.CSVWriter;
import com.mcmasterbaja.readwrite.Reader;
import com.mcmasterbaja.readwrite.Writer;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.math3.linear.MatrixUtils;
import org.apache.commons.math3.linear.RealMatrix;

public class SGolayFilter extends Analyzer {
  private final int windowSize;
  private final int polynomialDegree;

  public SGolayFilter(
      String[] inputFiles,
      String[] inputColumns,
      String[] outputFiles,
      int windowSize,
      int polynomialDegree) {
    super(inputFiles, inputColumns, outputFiles);
    this.windowSize = windowSize;
    this.polynomialDegree = polynomialDegree;
  }

  public SGolayFilter(String[] inputFiles, String[] inputColumns, String[] outputFiles) {
    super(inputFiles, inputColumns, outputFiles);
    this.windowSize = 300;
    this.polynomialDegree = 3;
  }

  @Override
  public void analyze() {
    System.out.println(
        "I so fussy wussy UwU. Applying Savitzky-Golay filter to "
            + super.inputFiles[0]
            + " to "
            + super.outputFiles[0]
            + " with window size "
            + windowSize
            + " and polynomial degree "
            + polynomialDegree);

    Reader r = new CSVReader(super.inputFiles[0]);
    Writer w = new CSVWriter(super.outputFiles[0]);

    w.write(sGolay(r.read(), windowSize, polynomialDegree));
  }

  public List<List<String>> sGolay(List<List<String>> data, int windowSize, int polynomialDegree) {
    // This would literally be a one liner in python... too bad no one said we should use python
    List<List<String>> dataPoints = new ArrayList<List<String>>();
    List<String> dataPoint = new ArrayList<String>(2);

    int independentColumn = this.getAnalysisColumnIndex(0, data.get(0));
    int dependentColumn = this.getAnalysisColumnIndex(1, data.get(0));

    // Add header
    dataPoint.add(data.get(0).get(independentColumn));
    dataPoint.add(data.get(0).get(dependentColumn));
    dataPoints.add(dataPoint);
    dataPoint = new ArrayList<String>(2);

    // Put first row of data in
    dataPoint.add(data.get(1).get(independentColumn));
    dataPoint.add(data.get(1).get(dependentColumn));
    dataPoints.add(dataPoint);
    dataPoint = new ArrayList<String>(2);

    int halfWindowSize = windowSize / 2;
    RealMatrix coeffMatrix = savGolCoeff(windowSize, polynomialDegree);

    for (int i = 2; i < data.size(); i++) {
      dataPoint.add(data.get(i).get(independentColumn)); // Add timestamp

      double smoothedValue = 0.0;

      for (int j = -halfWindowSize; j < halfWindowSize; j++) {
        int dataIndex = Math.min(Math.max(i + j, 1), data.size() - 1);
        double dataValue = Double.parseDouble(data.get(dataIndex).get(dependentColumn));
        smoothedValue += coeffMatrix.getEntry(halfWindowSize + j, 0) * dataValue;
      }

      dataPoint.add(Double.toString(Math.round(smoothedValue * 100.0) / 100.0));

      dataPoints.add(dataPoint);
      dataPoint = new ArrayList<String>(2);
    }

    return dataPoints;
  }

  public RealMatrix savGolCoeff(int windowSize, int polynomialDegree) {
    int m = (windowSize - 1) / 2;
    RealMatrix A = MatrixUtils.createRealMatrix(windowSize, polynomialDegree + 1);

    for (int i = -m; i <= m; i++) {
      for (int j = 0; j <= polynomialDegree; j++) {
        A.setEntry(i + m, j, Math.pow(i, j));
      }
    }

    RealMatrix A_transpose = A.transpose();
    RealMatrix A_tA_inv = MatrixUtils.inverse(A_transpose.multiply(A));
    RealMatrix C = A_tA_inv.multiply(A_transpose);

    return C.transpose();
  }

  // make a main to test it
  public static void main(String[] args) {
    // String[] filepaths = new String[1];
    // filepaths[0] = "C:/Users/graha/Downloads/F_RPM_PRIM.csv";

    // String[] outputFiles = new String[1];
    // outputFiles[0] = "C:/Users/graha/Downloads/F_RPM_PRIM_not_fussy.csv";

    // int windowSize = 1000;
    // int polynomialDegree = 2;

    // SGolayFilter s = new SGolayFilter(filepaths, outputFiles, windowSize, polynomialDegree);
    // s.analyze();
  }
}
