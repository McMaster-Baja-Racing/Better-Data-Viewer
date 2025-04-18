package com.mcmasterbaja.analyzer;

import com.mcmasterbaja.annotations.OnAnalyzerException;
import com.mcmasterbaja.exceptions.InvalidHeaderException;
import com.mcmasterbaja.model.AnalyzerParams;
import com.mcmasterbaja.model.AnalyzerType;
import com.opencsv.CSVReader;
import com.opencsv.ICSVWriter;
import jakarta.enterprise.context.Dependent;
import jakarta.inject.Inject;
import java.util.ArrayList;
import java.util.List;
import lombok.SneakyThrows;
import org.jboss.logging.Logger;

@Dependent
@AnalyzerQualifier(AnalyzerType.RDP_COMPRESSION)
@OnAnalyzerException
public class RDPCompressionAnalyzer extends Analyzer {

  // Epsilon is the maximum distance between a point and the line between the
  // start and end points
  // AKA Hausdorff distance
  private double epsilon;
  private int xAxisIndex;
  private int yAxisIndex;

  @Inject Logger logger;

  @Override
  @SneakyThrows
  public void analyze(AnalyzerParams params) {
    extractParams(params);
    this.epsilon = Double.parseDouble(params.getOptions()[0]);

    logger.info(
        "Compressing " + inputFiles[0] + " with epsilon " + epsilon + " to " + outputFiles[0]);

    getReader(
        inputFiles[0],
        reader -> {
          getWriter(
              outputFiles[0],
              writer -> {
                rdpIO(reader, writer, inputColumns);
              });
        });
  }

  @SneakyThrows
  public void rdpIO(CSVReader reader, ICSVWriter writer, String[] inputColumns) {
    String[] headers = reader.readNext();
    if (headers == null) {
      throw new InvalidHeaderException("Failed to read headers from input file: " + inputFiles[0]);
    }

    xAxisIndex = this.getColumnIndex(inputColumns[0], headers);
    yAxisIndex = this.getColumnIndex(inputColumns[1], headers);
    writer.writeNext(headers);

    List<String[]> data = reader.readAll();
    data = RamerDouglasPeucker(data, epsilon);

    for (String[] point : data) {
      writer.writeNext(point);
    }
  }

  public List<String[]> RamerDouglasPeucker(List<String[]> data, double epsilon) {

    // Find the point with the maximum distance from the line between the first and
    // last point
    double maxDistance = 0;
    int maxIndex = 0;
    for (int i = 1; i < data.size() - 1; i++) {
      double distance = perpendicularDistance(data.get(0), data.get(data.size() - 1), data.get(i));
      if (distance > maxDistance) {
        maxDistance = distance;
        maxIndex = i;
      }
    }

    // If the maximum distance is greater than epsilon, recursively simplify
    if (maxDistance > epsilon) {
      // Recursive call
      List<String[]> firstLine = RamerDouglasPeucker(data.subList(0, maxIndex + 1), epsilon);
      List<String[]> secondLine = RamerDouglasPeucker(data.subList(maxIndex, data.size()), epsilon);

      // Build the result list
      List<String[]> result = new ArrayList<String[]>();
      result.addAll(firstLine.subList(0, firstLine.size() - 1));
      result.addAll(secondLine);
      return result;
    } else {
      // Otherwise return the start and end points of the line
      return new ArrayList<String[]>(List.of(data.get(0), data.get(data.size() - 1)));
    }
  }

  private double perpendicularDistance(String[] lineStart, String[] lineEnd, String[] point) {
    double x1 = Double.parseDouble(lineStart[xAxisIndex]);
    double y1 = Double.parseDouble(lineStart[yAxisIndex]);
    double x2 = Double.parseDouble(lineEnd[xAxisIndex]);
    double y2 = Double.parseDouble(lineEnd[yAxisIndex]);
    double x0 = Double.parseDouble(point[xAxisIndex]);
    double y0 = Double.parseDouble(point[yAxisIndex]);

    return Math.abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1)
        / Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
  }
}
