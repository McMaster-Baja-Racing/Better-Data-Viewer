package com.mcmasterbaja.storage;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.DoubleSummaryStatistics;
import java.util.stream.Stream;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

@ApplicationScoped // Singleton I think
public class FileSystemStorageService implements StorageService {

  @Inject
  Logger logger;

  @ConfigProperty(name = "quarkus.http.body.uploads-directory")
  private Path rootLocation;

  public void init() {
    try {
      Files.createDirectories(rootLocation);
    } catch (IOException e) {
      logger.error("Could not initialize storage service", e);
    }
  }

  public Path getRootLocation() {
    return rootLocation;
  }

  public void store(InputStream fileData, Path targetPath) {
    try {
      Path destinationFile =
        rootLocation.resolve(targetPath).normalize().toAbsolutePath();
      
      if (!destinationFile.startsWith(this.rootLocation.toAbsolutePath())) {
        logger.error("Cannot store file outside current directory");
      }

      Files.createDirectories(destinationFile.getParent());
      Files.copy(fileData, destinationFile);
    } catch (IOException e) {
      logger.error("Could not store file", e);
    }
  }

  public Path load(Path targetPath) {
    return rootLocation.resolve(targetPath);
  }

  public void delete(Path targetPath) {
    try {
      Files.delete(rootLocation.resolve(targetPath));
    } catch (IOException e) {
      logger.error("Could not delete file", e);
    }
  }

  public Stream<Path> loadAll(Path dir) {
    try {
      return Files.walk(rootLocation.resolve(dir))
      .filter(path -> !Files.isDirectory(path))
      .map(rootLocation::relativize);
    } catch (IOException e) {
      logger.error("Could not list files", e);
      return Stream.empty();
    }
  }

  public Stream<Path> loadAll() {
    return loadAll(rootLocation);
  }

  public String[] readHeaders(Path targetPath) {
    try {
      logger.info("Reading headers from: " + targetPath);
      return Files.lines(rootLocation.resolve(targetPath)).findFirst().get().split(",");
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

      Path file = load(targetPath);
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
