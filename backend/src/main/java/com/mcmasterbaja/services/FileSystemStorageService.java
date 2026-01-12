package com.mcmasterbaja.services;

import com.mcmasterbaja.exceptions.FileNotFoundException;
import com.mcmasterbaja.exceptions.StorageException;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.StreamingOutput;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.stream.Stream;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

@ApplicationScoped // Singleton I think
public class FileSystemStorageService implements StorageService {

  @Inject Logger logger;

  @ConfigProperty(name = "quarkus.http.body.uploads-directory")
  private Path rootLocation;

  @PostConstruct
  public void init() {
    try {
      logger.info("Initializing storage service");
      Path[] directories = {
        rootLocation, rootLocation.resolve("csv/"), rootLocation.resolve("mp4/")
      };

      for (Path directory : directories) {
        if (!Files.exists(directory)) {
          Files.createDirectories(directory);
        } else {
          logger.info("Directory already exists: " + directory.toString());
        }
      }
    } catch (IOException e) {
      throw new StorageException("Failed to initialize the storage service.", e);
    }
  }

  public Path getRootLocation() {
    return rootLocation;
  }

  public void store(InputStream fileData, Path targetPath) {
    try {
      Path destinationFile = rootLocation.resolve(targetPath).normalize().toAbsolutePath();

      if (!destinationFile.startsWith(this.rootLocation.toAbsolutePath())) {
        throw new StorageException("Cannot store file outside current directory!");
      }

      Files.createDirectories(destinationFile.getParent());
      Files.copy(fileData, destinationFile);
      fileData.close();
    } catch (IOException e) {
      throw new StorageException("Could not store file: " + targetPath.toFile(), e);
    }
  }

  public Path load(Path targetPath) {
    return rootLocation.resolve(targetPath);
  }

  public Stream<Path> loadAll(Path dir) {
    try {
      return Files.walk(rootLocation.resolve(dir))
          .filter(path -> !Files.isDirectory(path))
          .map(rootLocation::relativize);
    } catch (IOException e) {
      throw new FileNotFoundException(
          "Could not list files inside directory: " + dir.toString(), e);
    }
  }

  public void withTempDirectory(String requestId, java.util.function.Consumer<Path> action) {
    Path tempDir = rootLocation.resolve("temp").resolve(requestId);
    try {
      Files.createDirectories(tempDir);
      logger.info("Created temp directory: " + tempDir);
      action.accept(tempDir);
    } catch (IOException e) {
      throw new StorageException("Failed to create temp directory for request: " + requestId, e);
    } finally {
      cleanupTempDirectory(tempDir);
    }
  }

  public StreamingOutput withTempDirectoryForStreaming(
      String requestId, java.util.function.Function<Path, StreamingOutput> function) {
    Path tempDir = rootLocation.resolve("temp").resolve(requestId);
    try {
      Files.createDirectories(tempDir);
      logger.info("Created temp directory: " + tempDir);

      // Execute with 1 minute timeout
      CompletableFuture<StreamingOutput> future =
          CompletableFuture.supplyAsync(() -> function.apply(tempDir));

      StreamingOutput userStream;
      try {
        userStream = future.get(1, TimeUnit.MINUTES);
      } catch (TimeoutException e) {
        future.cancel(true);
        logger.error("Analyzer operation timed out after 1 minute for request: " + requestId);
        cleanupTempDirectory(tempDir);
        throw new StorageException("Operation timed out after 1 minute", e);
      } catch (ExecutionException e) {
        logger.error("Analyzer operation failed for request: " + requestId, e.getCause());
        cleanupTempDirectory(tempDir);
        throw new StorageException("Operation failed: " + e.getCause().getMessage(), e.getCause());
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        cleanupTempDirectory(tempDir);
        throw new StorageException("Operation interrupted", e);
      }

      // Wrap the user's StreamingOutput to add cleanup after streaming
      return output -> {
        try {
          userStream.write(output);
        } finally {
          cleanupTempDirectory(tempDir);
        }
      };
    } catch (IOException e) {
      throw new StorageException("Failed to create temp directory for request: " + requestId, e);
    }
  }

  private void cleanupTempDirectory(Path tempDir) {
    try {
      if (Files.exists(tempDir)) {
        try (Stream<Path> walk = Files.walk(tempDir)) {
          walk.sorted(Comparator.reverseOrder())
              .forEach(
                  path -> {
                    try {
                      Files.delete(path);
                    } catch (IOException e) {
                      logger.warn("Failed to delete temp file: " + path, e);
                    }
                  });
        }
        logger.info("Cleaned up temp directory: " + tempDir);
      }
    } catch (IOException e) {
      logger.error("Failed to cleanup temp directory: " + tempDir, e);
    }
  }

  public Stream<Path> loadAll() {
    return loadAll(rootLocation);
  }

  public Stream<Path> loadDirectories(Path dir) {
    Path directory = rootLocation.resolve(dir);
    try {
      return Files.walk(rootLocation.resolve(dir), 1)
          .filter(path -> Files.isDirectory(path) && !path.equals(rootLocation.resolve(dir)))
          .map(directory::relativize);
    } catch (IOException e) {
      throw new FileNotFoundException(
          "Could not list directories inside directory: " + dir.toString(), e);
    }
  }

  public void delete(Path targetPath) {
    try {
      Files.delete(rootLocation.resolve(targetPath));
    } catch (IOException e) {
      throw new FileNotFoundException("Could not delete file: " + targetPath.toString(), e);
    }
  }

  // TODO: Does not regenerate csv/ or mp4/
  public void deleteAll(Path dir) {
    try {
      Files.walk(rootLocation.resolve(dir))
          .sorted(Comparator.reverseOrder())
          .forEach(
              file -> {
                try {
                  Files.delete(file);
                } catch (IOException e) {
                  throw new FileNotFoundException("Could not delete file: " + file.toString(), e);
                }
              });
    } catch (IOException e) {
      throw new FileNotFoundException("Could not delete directory: " + dir.toString(), e);
    }
  }

  public void deleteAll() {
    deleteAll(rootLocation);
  }
}
