package com.mcmasterbaja.storage;

import com.drew.imaging.mp4.Mp4MetadataReader;
import com.drew.metadata.Tag;
import com.drew.metadata.mp4.Mp4Directory;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.io.BufferedReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.DoubleSummaryStatistics;
import java.util.Locale;
import java.util.stream.Stream;
import org.apache.commons.io.input.ReversedLinesFileReader;
import org.jboss.logging.Logger;

@ApplicationScoped
public class DefaultFileMetadataService implements FileMetadataService {

  @Inject Logger logger;

  @Inject private StorageService storageService;

  public String[] readHeaders(Path targetPath) {
    try {
      // logger.info("Reading headers from: " + targetPath);
      return Files.lines(storageService.getRootLocation().resolve(targetPath))
          .findFirst()
          .get()
          .split(",");
    } catch (IOException e) {
      logger.error("Could not read headers", e);
      return new String[0];
    }
  }

  public Double[] getMinMax(Path targetPath, String column) {

    try {
      // First find the index of the column
      String[] headerArray = readHeaders(targetPath);
      int index = -1;

      for (int i = 0; i < headerArray.length; i++) {
        if (headerArray[i].equals(column)) {
          index = i;
          break;
        }
      }

      if (index == -1) {
        return null;
      }

      // Now find the max and min values

      Path file = storageService.load(targetPath);
      final int finalIndex = index;
      try (Stream<String> lines = Files.lines(file)) {
        DoubleSummaryStatistics stats =
            lines
                .skip(1) // Skip the header line
                .map(line -> line.split(",")[finalIndex])
                .mapToDouble(Double::parseDouble)
                .summaryStatistics();

        double min = stats.getMin();
        double max = stats.getMax();

        return new Double[] {min, max};
      }

    } catch (IOException e) {
      e.printStackTrace();
      return null;
    }
  }

  public String getLast(Path targetPath, String column) {

    String timestamp;

    try {
      ReversedLinesFileReader reverseReader =
          ReversedLinesFileReader.builder()
              .setPath(storageService.getRootLocation().resolve(targetPath))
              .setCharset(StandardCharsets.UTF_8)
              .get();

      timestamp = reverseReader.readLine().split(",")[0];
      reverseReader.close();
    } catch (IOException e) {
      e.printStackTrace();
      return null;
    }

    return timestamp;
  }

  public boolean canComputeTimespan(Path folderPath) {
    try {
      Path smhPath =
          storageService
              .getRootLocation()
              .resolve(folderPath.resolve("GPS SECOND MINUTE HOUR.csv"));
      Path dmyPath =
          storageService.getRootLocation().resolve(folderPath.resolve("GPS DAY MONTH YEAR.csv"));
      return Files.exists(smhPath) && Files.exists(dmyPath);
    } catch (Exception e) {
      e.printStackTrace();
      return false;
    }
  }

  public LocalDateTime[] getTimespan(Path targetPath, LocalDateTime zeroTime) {
    switch (getTypeFolder(targetPath.toString())) {
      case "csv":
        return getTimespanCSV(targetPath, zeroTime);
      case "mp4":
        return getTimespanMP4(targetPath);
      default:
        return null;
    }
  }

  public LocalDateTime getZeroTime(Path folderPath) {
    try {
      // Get the values of the first line from the gps files ingoring the header
      String[] smhArray =
          Files.lines(
                  storageService
                      .getRootLocation()
                      .resolve(folderPath.resolve("GPS SECOND MINUTE HOUR.csv")))
              .skip(1)
              .findFirst()
              .orElseThrow()
              .split(",");

      String[] dmyArray =
          Files.lines(
                  storageService
                      .getRootLocation()
                      .resolve(folderPath.resolve("GPS DAY MONTH YEAR.csv")))
              .skip(1)
              .findFirst()
              .orElseThrow()
              .split(",");

      // Convert the values to a LocalDateTime and subtract the timestamp
      long timestamp = Long.parseLong(smhArray[0]);
      LocalDateTime zeroTime =
          LocalDateTime.of(
                  2000 + Integer.parseInt(dmyArray[3]),
                  Integer.parseInt(dmyArray[2]),
                  Integer.parseInt(dmyArray[1]),
                  Integer.parseInt(smhArray[3]),
                  Integer.parseInt(smhArray[2]),
                  Integer.parseInt(smhArray[1]))
              .minusNanos(timestamp * 1_000_000);

      return zeroTime;
    } catch (IOException e) {
      e.printStackTrace();
      return null;
    }
  }

  public String getTypeFolder(String pathString) {
    int dotIndex = pathString.lastIndexOf(".");
    if (pathString == "" || pathString == null || dotIndex == -1) return ""; // No file extension

    String extension = pathString.substring(dotIndex + 1).toLowerCase();
    // Returns csv for bin and mp4 for mov for file conversion
    switch (extension) {
      case "bin":
        return "csv";
      case "mov":
        return "mp4";
      default:
        return extension;
    }
  }

  // Returns all the metadata in the file as string with commas between each value
  // Each value will be in the format "key - value"
  private String extractMetadata(Path file) {
    try {
      // Gets all the  metadata from the file in the form of a directory
      Mp4Directory metadata =
          Mp4MetadataReader.readMetadata(file.toFile()).getFirstDirectoryOfType(Mp4Directory.class);

      // Extracts all the key value pairs
      String metadataString = "";
      for (Tag tag : metadata.getTags()) {
        metadataString += tag.toString() + ",";
      }
      return metadataString;

    } catch (IOException e) {
      e.printStackTrace();
    }

    return null;
  }

  // Gets the value of a tag from the metadata of a file
  private String getTagValue(String metadata, String tag) {
    // Finds the tag in the metadata
    String[] metadataArray = metadata.split(",");
    for (String tagString : metadataArray) {
      if (tagString.contains(tag)) {
        return tagString.split(" - ")[1];
      }
    }

    return null;
  }

  private LocalDateTime[] getTimespanCSV(Path targetPath, LocalDateTime zeroTime) {
    String firstTimestamp = null;
    String lastTimestamp = null;
    try {
      BufferedReader reader =
          new BufferedReader(
              Files.newBufferedReader(storageService.getRootLocation().resolve(targetPath)));
      firstTimestamp = reader.lines().skip(1).findFirst().orElseThrow().split(",")[0];
      reader.close();
      lastTimestamp = getLast(targetPath, "Timestamp (ms)");
    } catch (IOException e) {
      e.printStackTrace();
      return null;
    }

    LocalDateTime startTime =
        zeroTime.plusNanos((long) Double.parseDouble(firstTimestamp) * 1_000_000);
    LocalDateTime endTime =
        zeroTime.plusNanos((long) Double.parseDouble(lastTimestamp) * 1_000_000);

    return new LocalDateTime[] {startTime, endTime};
  }

  private LocalDateTime[] getTimespanMP4(Path targetPath) {
    // Gets the metadata of the file to find the creation time and duration
    String metadata = extractMetadata(storageService.getRootLocation().resolve(targetPath));

    // Parses with timezeone, converts to GMT, and then to LocalDateTime
    assert metadata != null;
    LocalDateTime creationTime =
        ZonedDateTime.parse(
                getTagValue(metadata, "Creation Time"),
                DateTimeFormatter.ofPattern("EEE MMM dd HH:mm:ss zzz yyyy", Locale.ENGLISH))
            .withZoneSameInstant(ZoneId.of("GMT"))
            .toLocalDateTime();

    // Below calculation gives a better estimate than Duration in Seconds tag
    // Each is converted to nanoseconds and then divided to preserve precision
    long duration =
        (Long.parseLong(getTagValue(metadata, "Duration")) * 1_000_000_000)
            / (Long.parseLong(getTagValue(metadata, "Media Time Scale")) * 1_000_000_000);

    // Returns the start and end times as strings in GMT with milliseconds
    return new LocalDateTime[] {creationTime, creationTime.plusSeconds(duration)};
  }
}
