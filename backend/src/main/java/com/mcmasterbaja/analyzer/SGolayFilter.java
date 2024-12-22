package com.mcmasterbaja.analyzer;

import com.mcmasterbaja.annotations.OnAnalyzerException;
import com.mcmasterbaja.exceptions.InvalidHeaderException;
import com.opencsv.CSVReader;
import com.opencsv.ICSVWriter;
import java.util.ArrayDeque;
import java.util.Deque;
import lombok.SneakyThrows;
import org.apache.commons.math3.linear.MatrixUtils;
import org.apache.commons.math3.linear.RealMatrix;

@OnAnalyzerException
public class SGolayFilter extends Analyzer {
  private final int windowSize;
  private final int polynomialDegree;
  private final CircularBuffer dataBuffer;
  private final CircularBuffer timestampBuffer;

  public SGolayFilter(
      String[] inputFiles,
      String[] inputColumns,
      String[] outputFiles,
      int windowSize,
      int polynomialDegree) {
    super(inputFiles, inputColumns, outputFiles);
    this.windowSize = windowSize;
    this.polynomialDegree = polynomialDegree;
    this.dataBuffer = new CircularBuffer(windowSize);
    // Half the size of the data buffer so that when we write data, we write it in the middle
    // (looking forwards and backwards)
    this.timestampBuffer = new CircularBuffer(windowSize / 2);
  }

  public SGolayFilter(String[] inputFiles, String[] inputColumns, String[] outputFiles) {
    super(inputFiles, inputColumns, outputFiles);
    this.windowSize = 300;
    this.polynomialDegree = 3;
    this.dataBuffer = new CircularBuffer(windowSize);
    this.timestampBuffer = new CircularBuffer(windowSize / 2);
  }

  class CircularBuffer {
    private final Deque<Double> buffer;
    private final int maxSize;

    public CircularBuffer(int size) {
      this.buffer = new ArrayDeque<>(size);
      this.maxSize = size;
    }

    public void addPoint(double point) {
      if (buffer.size() == maxSize) {
        buffer.removeFirst();
      }
      buffer.addLast(point);
    }

    public Double[] getPoints() {
      return buffer.toArray(new Double[0]);
    }

    public int size() {
      return buffer.size();
    }

    public double getFirst() {
      return buffer.getFirst();
    }
  }

  @Override
  @SneakyThrows
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

    CSVReader reader = getReader(inputFiles[0]);
    ICSVWriter writer = getWriter(outputFiles[0]);

    String[] headers = reader.readNext();
    if (headers==null) { throw new InvalidHeaderException("Failed to read headers from input file: " + inputFiles[0]); }

    int xAxisIndex = this.getColumnIndex(inputColumns[0], headers);
    int yAxisIndex = this.getColumnIndex(inputColumns[1], headers);
    writer.writeNext(headers);

    String[] dataPoint;
    RealMatrix coeffMatrix = savGolCoeff(windowSize, polynomialDegree);

    while ((dataPoint = reader.readNext()) != null) {
      dataBuffer.addPoint(Double.parseDouble(dataPoint[yAxisIndex]));
      timestampBuffer.addPoint(Double.parseDouble(dataPoint[xAxisIndex]));

      // Make sure buffer is full
      if (dataBuffer.size() < windowSize) {
        continue;
      }

      double smoothedValue = 0.0;
      Double[] dataPoints = dataBuffer.getPoints();

      for (int i = 0; i < dataBuffer.size(); i++) {
        smoothedValue += coeffMatrix.getEntry(i, 0) * dataPoints[i];
      }

      String x = Double.toString(timestampBuffer.getFirst());
      String y = Double.toString(smoothedValue);
      writer.writeNext(new String[] {x, y});
    }

    reader.close();
    writer.close();
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
}
