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
import java.util.Arrays;
import java.util.List;
import lombok.SneakyThrows;
import org.jboss.logging.Logger;

@Dependent
@AnalyzerQualifier(AnalyzerType.STRICT_TIMESTAMP)
@OnAnalyzerException
public class StrictTimestampAnalyzer extends Analyzer {

  @Inject Logger logger;

  private static final String TIMESTAMP_COLUMN = "Timestamp (ms)";
  private static final long MAX_GAP = 10_000L;
  private static final int MIN_CONSECUTIVE_LARGE = 3;

  @Override
  @SneakyThrows
  public void analyze(AnalyzerParams params) {
    extractParams(params);

    logger.info(
        "Filtering file "
            + inputFiles[0]
            + " to ensure strictly increasing timestamps in column '"
            + TIMESTAMP_COLUMN
            + "', filtering single or two large gaps > "
            + MAX_GAP
            + "ms");
    getReader(
        inputFiles[0],
        reader -> getWriter(getOutputFilename(), writer -> filterIO(reader, writer)));
  }

  @SneakyThrows
  private void filterIO(CSVReader reader, ICSVWriter writer) {
    String[] headers = reader.readNext();
    if (headers == null) {
      throw new InvalidHeaderException("Failed to read headers from input file: " + inputFiles[0]);
    }

    int timestampIndex = getColumnIndex(TIMESTAMP_COLUMN, headers);
    writer.writeNext(headers);

    String[] row;
    long lastTimestamp = Long.MIN_VALUE;

    // Buffer for consecutive large-gap rows
    List<String[]> largeGapBuffer = new ArrayList<>();

    while ((row = reader.readNext()) != null) {
      long currentTimestamp;
      try {
        currentTimestamp = Long.parseLong(row[timestampIndex].trim());
      } catch (NumberFormatException e) {
        logger.warn("Skipping row with invalid timestamp: " + Arrays.toString(row));
        continue;
      }

      if (currentTimestamp <= lastTimestamp) {
        logger.info("Dropping non-increasing timestamp row: " + Arrays.toString(row));
        continue;
      }

      long gap = (lastTimestamp == Long.MIN_VALUE) ? 0 : currentTimestamp - lastTimestamp;
      if (gap <= MAX_GAP) {
        // Flush buffer if any
        if (!largeGapBuffer.isEmpty()) {
          if (largeGapBuffer.size() >= MIN_CONSECUTIVE_LARGE) {
            // Keep buffered rows
            for (String[] bufRow : largeGapBuffer) {
              writer.writeNext(bufRow);
            }
            lastTimestamp =
                Long.parseLong(
                    largeGapBuffer.get(largeGapBuffer.size() - 1)[timestampIndex].trim());
          } else {
            logger.info(
                "Discarding " + largeGapBuffer.size() + " rows with gaps > " + MAX_GAP + "ms");
          }
          largeGapBuffer.clear();
        }
        // Write current row normally
        writer.writeNext(row);
        lastTimestamp = currentTimestamp;
      } else {
        // Large gap: buffer for potential keep/discard
        largeGapBuffer.add(row);
        // If buffer reached threshold, flush immediately
        if (largeGapBuffer.size() >= MIN_CONSECUTIVE_LARGE) {
          for (String[] bufRow : largeGapBuffer) {
            writer.writeNext(bufRow);
          }
          logger.info(
              "Flushing " + largeGapBuffer.size() + " large-gap rows as consecutive threshold met");
          lastTimestamp =
              Long.parseLong(largeGapBuffer.get(largeGapBuffer.size() - 1)[timestampIndex].trim());
          largeGapBuffer.clear();
        }
      }
    }

    // End of data: discard any leftover buffer smaller than threshold
    if (!largeGapBuffer.isEmpty()) {
      if (largeGapBuffer.size() >= MIN_CONSECUTIVE_LARGE) {
        for (String[] bufRow : largeGapBuffer) {
          writer.writeNext(bufRow);
        }
      } else {
        logger.info(
            "Discarding trailing " + largeGapBuffer.size() + " rows with gaps > " + MAX_GAP + "ms");
      }
    }
  }
}
