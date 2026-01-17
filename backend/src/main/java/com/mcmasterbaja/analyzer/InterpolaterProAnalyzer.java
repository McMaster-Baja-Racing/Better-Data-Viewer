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
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;
import lombok.SneakyThrows;
import org.jboss.logging.Logger;

// The goal of this analyzer is to take in any number of files, and combine them all into a single
// file based on the timestamp

@Dependent
@AnalyzerQualifier(AnalyzerType.INTERPOLATER_PRO)
@OnAnalyzerException
public class InterpolaterProAnalyzer extends Analyzer {

  @Inject Logger logger;

  // Class to store timestamp and file index
  class TimestampData {
    double timestamp;
    int fileIndex;

    TimestampData(double timestamp, int fileIndex) {
      this.timestamp = timestamp;
      this.fileIndex = fileIndex;
    }
  }

  @Override
  @SneakyThrows
  public void analyze(AnalyzerParams params) {
    extractParams(params);

    // Construct string to print message for all input files
    StringBuilder inputFilesString = new StringBuilder();
    for (int i = 0; i < inputFiles.length; i++) {
      inputFilesString.append("\"").append(inputFiles[i]).append("\"");
      if (i != inputFiles.length - 1) {
        inputFilesString.append(", ");
      }
    }
    logger.info("Interpolating " + inputFilesString + " to \"" + outputFiles[0] + "\"");

    // So first step would be to get the reader and writer
    // Then we can create the header using the first file along with the extra
    // column from the other
    // files
    // Then we can start reading the files and writing them to the output file

    // First lets get the readers for every single file, and one writer for the
    // output file
    getReaders(
        inputFiles,
        readersMap -> {
          getWriter(
              outputFiles[0],
              writer -> {
                interpolatorIO(readersMap, writer, inputColumns);
              });
        });
  }

  @SneakyThrows
  public void interpolatorIO(
      Map<String, CSVReader> readersMap, ICSVWriter writer, String[] inputColumns) {
    // Start timer
    long startTime = System.nanoTime();

    List<CSVReader> readers = new ArrayList<>(readersMap.values());

    // Now, using the readers, we need to find which column is the timestamp column
    // and which is the
    // data column in each file
    // We can do this by looking at the first row of each file and using the
    // getAnalysisColumnIndex
    // function
    int[] timestampIndices = new int[inputFiles.length];
    int[] dataIndices = new int[inputFiles.length];

    for (int i = 0; i < readers.size(); i++) {
      CSVReader reader = readers.get(i);
      String[] headers = reader.readNext();
      if (headers == null) {
        throw new InvalidHeaderException(
            "Failed to read headers from input file: " + inputFiles[0]);
      }

      timestampIndices[i] = getColumnIndex("Timestamp (ms)", headers);
      dataIndices[i] = getColumnIndex(inputColumns[i], headers);
    }

    // Now copy write the headers, which will be "timestamp (ms)" followed by
    // inputColumns
    List<String> headers = new ArrayList<String>();
    headers.add("Timestamp (ms)");
    Collections.addAll(headers, inputColumns);
    writer.writeNext(headers.toArray(new String[0]));
    writer.flush();

    // Now we need to start reading the files and writing them to the output file
    // Ideally, our final file should have a set of timestamps that is the union of
    // all the
    // timestamps in the input files
    // For each corresponding data point, if we can take the two closest points and
    // interpolate
    // between them, we can get the data point for that timestamp
    // First, get the first two timestamps from each file and populate a priority
    // Queue with them
    // At the same time, we need to store the current and previous data points for
    // each file

    // Priority queue here tells us the next smallest timestamp
    PriorityQueue<TimestampData> queue =
        new PriorityQueue<TimestampData>((a, b) -> Double.compare(a.timestamp, b.timestamp));

    // We need to keep track of the previous and current data points for each file
    double[] previousData = new double[readers.size()];
    double[] currentData = new double[readers.size()];

    // We also need to keep track of the previous and current timestamps for each
    // file
    double[] previousTimestamp = new double[readers.size()];
    double[] currentTimestamp = new double[readers.size()];

    // Finally, we need previous and current queue timestamps
    double queuePreviousTimestamp = 0;
    double queueCurrentTimestamp = 0;

    // Next, lets load in the first timestamps, and get the maximum
    double maxTimestamp = -1;
    int maxTimestampIndex = -1;

    for (int i = 0; i < readers.size(); i++) {
      String[] line = readers.get(i).readNext();

      double timestamp = Double.parseDouble(line[timestampIndices[i]]);
      double data = Double.parseDouble(line[dataIndices[i]]);

      previousData[i] = data;
      previousTimestamp[i] = timestamp;

      // Do it again
      line = readers.get(i).readNext();

      timestamp = Double.parseDouble(line[timestampIndices[i]]);
      data = Double.parseDouble(line[dataIndices[i]]);

      if (timestamp > maxTimestamp) {
        maxTimestamp = timestamp;
        maxTimestampIndex = i;
      }

      currentData[i] = data;
      currentTimestamp[i] = timestamp;
    }

    // Now, we need to keep reading through every other file except the maximum
    // until we reach the
    // maximum timestamp
    for (int i = 0; i < readers.size(); i++) {
      if (i == maxTimestampIndex) {
        continue;
      }

      while (currentTimestamp[i] < maxTimestamp) {
        String[] line = readers.get(i).readNext();

        double timestamp = Double.parseDouble(line[timestampIndices[i]]);
        double data = Double.parseDouble(line[dataIndices[i]]);

        previousData[i] = currentData[i];
        previousTimestamp[i] = currentTimestamp[i];

        currentData[i] = data;
        currentTimestamp[i] = timestamp;
      }
    }

    // Next, populate the queue with the current timestamps
    for (int i = 0; i < readers.size(); i++) {
      queue.add(new TimestampData(currentTimestamp[i], i));
    }
    // Now we have our timestamps, we can start going through the files

    // At this point, we've skipped all the non-overlapping data points
    // And populated the different values we need
    // The concept of the next loop (which writes all the data) is as follows:
    // 1. Read from file x
    // 2. Add data from file x and fabricate data for every other file at this
    // timestamp
    // 3. Find next global timestamp (could be same file)
    // 4. Repeat
    // The queue automatically gets the next timestamp (orders properly) since
    // we always populate it with one timestamp from each file.
    // The previous and current timestamp / data is for interpolation

    // Loop until priorityQueue is empty (Technically won't get here unless all
    // files have same end)
    while (!queue.isEmpty()) {
      // Each loop, we will take the top element from the queue, then create a
      // datapoint for all the
      // files and write it
      TimestampData queueData = queue.poll();

      queuePreviousTimestamp = queueCurrentTimestamp;
      queueCurrentTimestamp = queueData.timestamp;

      // If its not a duplicate timestamp, add the data point
      if (queueData.timestamp != queuePreviousTimestamp) {
        // Now we loop through the files and create a datapoint for each one
        List<String> dataPoint = new ArrayList<String>();
        dataPoint.add(Double.toString(queueData.timestamp)); // Add timestamp
        // Loop through files and add data
        for (int i = 0; i < readers.size(); i++) {
          // If the timestamp is the same, just add the data
          if (currentTimestamp[i] == queueData.timestamp) {
            dataPoint.add(Double.toString(currentData[i]));
          } else {
            // Otherwise, we need to interpolate
            double interpolatedData =
                interpolate(
                    previousTimestamp[i],
                    previousData[i],
                    currentTimestamp[i],
                    currentData[i],
                    queueData.timestamp);
            dataPoint.add(Double.toString(interpolatedData));
          }
        }
        // Now we can write the data point
        writer.writeNext(dataPoint.toArray(new String[0]));
        writer.flush();
      }

      // Now we need to read the next line from the file that we just used
      String[] line = readers.get(queueData.fileIndex).readNext();
      // if the line is null, then we can end the loop
      if (line == null) {
        break;
      }

      // Otherwise, we need to update the previous and current data and timestamps
      previousData[queueData.fileIndex] = currentData[queueData.fileIndex];
      previousTimestamp[queueData.fileIndex] = currentTimestamp[queueData.fileIndex];

      currentData[queueData.fileIndex] = Double.parseDouble(line[dataIndices[queueData.fileIndex]]);
      currentTimestamp[queueData.fileIndex] =
          Double.parseDouble(line[timestampIndices[queueData.fileIndex]]);

      // Now we need to add the new timestamp to the queue
      queue.add(new TimestampData(currentTimestamp[queueData.fileIndex], queueData.fileIndex));
    }

    // End time
    long endTime = System.nanoTime();

    // Print completed
    logger.info("Completed interpolation in " + (endTime - startTime) / 1000000 + "ms");
  }

  // Interpolate method
  public double interpolate(double x1, double y1, double x2, double y2, double x) {
    // y = mx + b
    // m = (y2 - y1) / (x2 - x1)
    // b = y1 - mx1
    double m = (y2 - y1) / (x2 - x1);
    double b = y1 - m * x1;

    return m * x + b;
  }
}

// my mother is a fish