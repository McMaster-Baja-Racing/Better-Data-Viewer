package com.mcmasterbaja.analyzer;

import com.mcmasterbaja.annotations.OnAnalyzerException;
import com.mcmasterbaja.exceptions.InvalidHeaderException;
import com.mcmasterbaja.model.AnalyzerParams;
import com.mcmasterbaja.model.AnalyzerType;
import com.opencsv.CSVReader;
import com.opencsv.ICSVWriter;
import com.opencsv.exceptions.CsvValidationException;
import jakarta.enterprise.context.Dependent;
import jakarta.inject.Inject;
import java.io.IOException;
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
  private CircularBuffer timestampBuffer;
  private CircularBuffer[] dataBuffers;

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
  @OnAnalyzerException
  public void analyze(AnalyzerParams params) {
    extractParams(params);
    this.windowSize = Integer.parseInt(params.getOptions()[0]);
    if (this.windowSize % 2 == 0) {
      this.windowSize += 1;
    }
    this.polynomialDegree = Integer.parseInt(params.getOptions()[1]);
    this.timestampBuffer = new CircularBuffer(this.windowSize);
    // Support multiple data columns
    this.dataBuffers = new CircularBuffer[inputColumns.length];
    for (int i = 0; i < inputColumns.length; i++) {
      dataBuffers[i] = new CircularBuffer(this.windowSize);
    }

    logger.info(
        "I so fussy wussy UwU. Applying Savitzky-Golay filter to "
            + super.inputFiles[0]
            + " to "
            + super.outputFiles[0]
            + " with window size "
            + this.windowSize
            + " and polynomial degree "
            + this.polynomialDegree
            + " on columns: " + String.join(", ", inputColumns));

    getReader(
        this.inputFiles[0],
        reader -> {
          getWriter(
              this.outputFiles[0],
              writer -> {
                try {
                  multiSavGolIO(reader, writer, inputColumns);
                } catch (Exception e) {
                  logger.warn(e.getMessage(), e);
                }
              });
        });
  }

  public void multiSavGolIO(CSVReader reader, ICSVWriter writer, String[] inputColumns)
      throws IOException, CsvValidationException {
    String[] headers = reader.readNext();
    if (headers == null) {
      throw new InvalidHeaderException("Failed to read headers from input file: " + inputFiles[0]);
    }

    int timestampIdx = this.getColumnIndex("Timestamp (ms)", headers);
    // Filter out 'Timestamp (ms)' from inputColumns
    java.util.List<String> filteredColumns = new java.util.ArrayList<>();
    java.util.List<Integer> filteredIdxs = new java.util.ArrayList<>();
    java.util.List<CircularBuffer> filteredBuffers = new java.util.ArrayList<>();
    for (int i = 0; i < inputColumns.length; i++) {
      if (!inputColumns[i].equalsIgnoreCase("Timestamp (ms)")) {
        filteredColumns.add(inputColumns[i]);
        filteredIdxs.add(this.getColumnIndex(inputColumns[i], headers));
        filteredBuffers.add(dataBuffers[i]);
      }
    }

    // Output headers: Timestamp + Smoothed columns
    String[] outHeaders = new String[1 + filteredColumns.size()];
    outHeaders[0] = headers[timestampIdx];
    for (int i = 0; i < filteredColumns.size(); i++) {
      outHeaders[i + 1] = filteredColumns.get(i);
    }
    writer.writeNext(outHeaders);

    String[] dataPoint;
    RealMatrix coeffMatrix = savGolCoeff(windowSize, polynomialDegree);

    while ((dataPoint = reader.readNext()) != null) {
      try {
        double timestamp = Double.parseDouble(dataPoint[timestampIdx]);
        timestampBuffer.addPoint(timestamp);
        for (int i = 0; i < filteredColumns.size(); i++) {
          double val = Double.parseDouble(dataPoint[filteredIdxs.get(i)]);
          filteredBuffers.get(i).addPoint(val);
        }
      } catch (NumberFormatException e) {
        continue;
      }

      // Make sure all buffers are full
      boolean allFull = timestampBuffer.size() >= windowSize;
      for (int i = 0; i < filteredColumns.size(); i++) {
        if (filteredBuffers.get(i).size() < windowSize) {
          allFull = false;
          break;
        }
      }
      if (!allFull) continue;

      String[] outRow = new String[1 + filteredColumns.size()];
      outRow[0] = Double.toString(timestampBuffer.getFirst());
      for (int i = 0; i < filteredColumns.size(); i++) {
        double smoothed = 0.0;
        Double[] points = filteredBuffers.get(i).getPoints();
        for (int j = 0; j < windowSize; j++) {
          smoothed += coeffMatrix.getEntry(j, 0) * points[j];
        }
        outRow[i + 1] = Double.toString(smoothed);
      }
      writer.writeNext(outRow);
    }
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
