package com.mcmasterbaja.services;

import com.drew.imaging.mp4.Mp4MetadataReader;
import com.drew.metadata.Tag;
import com.drew.metadata.mp4.Mp4Directory;
import com.mcmasterbaja.exceptions.FileNotFoundException;
import com.mcmasterbaja.exceptions.MalformedCsvException;
import com.mcmasterbaja.exceptions.StorageException;
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
import java.util.Arrays;
import java.util.Locale;
import java.util.NoSuchElementException;
import org.apache.commons.io.input.ReversedLinesFileReader;
import org.jboss.logging.Logger;

@ApplicationScoped
public class DefaultFileMetadataService implements FileMetadataService {

  @Inject Logger logger;
  @Inject private StorageService storageService;

  public String[] readHeaders(Path targetPath) {
    try {
      return Files.lines(storageService.load(targetPath)).findFirst().get().split(",");
    } catch (IOException e) {
      throw new FileNotFoundException(
          "Could not read headers of file: " + targetPath.toString(), e);
    } catch (NoSuchElementException e) {
      throw new MalformedCsvException(
          "Could not read headers of file: " + targetPath.toString(), targetPath.toString(), e);
    }
  }

  public long getSize(Path targetPath) {
    try {
      return Files.size(storageService.load(targetPath));
    } catch (IOException e) {
      throw new StorageException("Failed to get size of file: " + targetPath.toString(), e);
    }
  }

  public Double[] getMinMax(Path targetPath, String column) {
    int columnIndex = -1;
    Double min = Double.MAX_VALUE;
    Double max = Double.MIN_VALUE;

    try {
      BufferedReader reader =
          new BufferedReader(Files.newBufferedReader(storageService.load(targetPath)));

      // First get the column index
      String[] headers = reader.readLine().split(",");

      for (int i = 0; i < headers.length; i++) {
        if (headers[i].equals(column)) {
          columnIndex = i;
          break;
        }
      }

      if (columnIndex == -1) {
        throw new IllegalArgumentException("Column not found in file: " + targetPath.toString());
      }

      // Then get the minimum and maximum values
      String line;
      while ((line = reader.readLine()) != null) {
        String[] values = line.split(",");
        Double value = Double.parseDouble(values[columnIndex]);
        if (value < min) {
          min = value;
        }
        if (value > max) {
          max = value;
        }
      }

    } catch (IOException e) {
      throw new FileNotFoundException("Failed to get min max of file: " + targetPath.toString(), e);
    } catch (NumberFormatException e) {
      throw new MalformedCsvException(
          "Failed to get min max of file: " + targetPath.toString(), targetPath.toString(), e);
    }

    return new Double[] {min, max};
  }

  public String getLast(Path targetPath, int columnIndex) {

    String timestamp;

    try {
      ReversedLinesFileReader reverseReader =
          ReversedLinesFileReader.builder()
              .setPath(storageService.load(targetPath))
              .setCharset(StandardCharsets.UTF_8)
              .get();

      timestamp = reverseReader.readLine().split(",")[columnIndex];
      reverseReader.close();
    } catch (IOException e) {
      throw new FileNotFoundException("Failed to get last of file: " + targetPath.toString(), e);
    }

    return timestamp;
  }

  public boolean canComputeTimespan(Path folderPath) {
    Path smhPath =
        storageService.getRootLocation().resolve(folderPath.resolve("GPS SECOND MINUTE HOUR.csv"));
    Path dmyPath = storageService.load(folderPath.resolve("GPS DAY MONTH YEAR.csv"));
    return Files.exists(smhPath) && Files.exists(dmyPath);
  }

  public LocalDateTime[] getTimespan(Path targetPath, LocalDateTime zeroTime) {
    switch (getTypeFolder(targetPath)) {
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
      throw new FileNotFoundException(
          "Failed to get zeroTime of file: " + folderPath.toString(), e);
    }
  }

  public String getTypeFolder(Path targetPath) {
    String pathString = targetPath.toString();
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
  private String extractMetadata(Path targetPath) {
    try {
      // Gets all the  metadata from the file in the form of a directory
      Mp4Directory metadata =
          Mp4MetadataReader.readMetadata(targetPath.toFile())
              .getFirstDirectoryOfType(Mp4Directory.class);

      // Extracts all the key value pairs
      String metadataString = "";
      for (Tag tag : metadata.getTags()) {
        metadataString += tag.toString() + ",";
      }
      return metadataString;

    } catch (IOException e) {
      throw new FileNotFoundException(
          "Failed to extract metadata of file: " + targetPath.toString(), e);
    }
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
          new BufferedReader(Files.newBufferedReader(storageService.load(targetPath)));
      int timestampIndex = Arrays.asList(reader.readLine().split(",")).indexOf("Timestamp (ms)");
      firstTimestamp = reader.readLine().split(",")[timestampIndex];
      reader.close();
      lastTimestamp = getLast(targetPath, timestampIndex);
    } catch (IOException e) {
      throw new FileNotFoundException(
          "Failed to get timespan of file: " + targetPath.toString(), e);
    } catch (NoSuchElementException e) {
      throw new MalformedCsvException(
          "Failed to get timespan of file: " + targetPath.toString(), targetPath.toString(), e);
    }

    LocalDateTime startTime =
        zeroTime.plusNanos((long) Double.parseDouble(firstTimestamp) * 1_000_000);
    LocalDateTime endTime =
        zeroTime.plusNanos((long) Double.parseDouble(lastTimestamp) * 1_000_000);

    return new LocalDateTime[] {startTime, endTime};
  }

  private LocalDateTime[] getTimespanMP4(Path targetPath) {
    // Gets the metadata of the file to find the creation time and duration
    String metadata = extractMetadata(storageService.load(targetPath));

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
