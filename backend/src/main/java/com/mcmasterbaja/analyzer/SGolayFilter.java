package com.mcmasterbaja.analyzer;

import com.mcmasterbaja.annotations.OnAnalyzerException;
import com.mcmasterbaja.exceptions.InvalidHeaderException;
import com.mcmasterbaja.model.AnalyzerParams;
import com.mcmasterbaja.model.AnalyzerType;
import jakarta.enterprise.context.Dependent;
import jakarta.inject.Inject;
import java.util.ArrayDeque;
import java.util.Deque;
import lombok.SneakyThrows;
import org.apache.commons.math3.linear.MatrixUtils;
import org.apache.commons.math3.linear.RealMatrix;
import org.jboss.logging.Logger;

@Dependent
@AnalyzerQualifier(AnalyzerType.SGOLAY)
@OnAnalyzerException
public class SGolayFilter extends Analyzer {
  private int windowSize;
  private int polynomialDegree;
  private CircularBuffer dataBuffer;
  private CircularBuffer timestampBuffer;

  @Inject Logger logger;

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
  public void analyze(AnalyzerParams params) {
    extractParams(params);
    this.windowSize = Integer.parseInt(params.getOptions()[0]);
    this.polynomialDegree = Integer.parseInt(params.getOptions()[1]);
    this.dataBuffer = new CircularBuffer(windowSize);
    // Half the size of the data buffer so that when we write data, we write it in
    // the middle
    // (looking forwards and backwards)
    this.timestampBuffer = new CircularBuffer(windowSize / 2);

    logger.info(
        "I so fussy wussy UwU. Applying Savitzky-Golay filter to "
            + super.inputFiles[0]
            + " to "
            + super.outputFiles[0]
            + " with window size "
            + windowSize
            + " and polynomial degree "
            + polynomialDegree);

    getReader(
        inputFiles[0],
        reader -> {
          getWriter(
              outputFiles[0],
              writer -> {
                String[] headers = safeReadNext(reader);
                if (headers == null) {
                  throw new InvalidHeaderException(
                      "Failed to read headers from input file: " + inputFiles[0]);
                }

                int xAxisIndex = this.getColumnIndex(inputColumns[0], headers);
                int yAxisIndex = this.getColumnIndex(inputColumns[1], headers);
                writer.writeNext(headers);

                String[] dataPoint;
                RealMatrix coeffMatrix = savGolCoeff(windowSize, polynomialDegree);

                while ((dataPoint = safeReadNext(reader)) != null) {
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
              });
        });
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
