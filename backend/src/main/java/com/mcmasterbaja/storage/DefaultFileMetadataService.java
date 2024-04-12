package com.mcmasterbaja.storage;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.DoubleSummaryStatistics;
import java.util.stream.Stream;

import org.jboss.logging.Logger;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class DefaultFileMetadataService implements FileMetadataService {

  @Inject
  Logger logger;

  @Inject
  private StorageService storageService;

  public String[] readHeaders(Path targetPath) {
    try {
      logger.info("Reading headers from: " + targetPath);
      return Files.lines(storageService.getRootLocation().resolve(targetPath)).findFirst().get().split(",");
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
  
}
