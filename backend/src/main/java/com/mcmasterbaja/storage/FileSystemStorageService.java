package com.mcmasterbaja.storage;

import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.stream.Stream;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import com.mcmasterbaja.storage.exceptions.FileNotFoundException;
import com.mcmasterbaja.storage.exceptions.StorageException;

@ApplicationScoped // Singleton I think
public class FileSystemStorageService implements StorageService {

  @Inject Logger logger;

  @ConfigProperty(name = "quarkus.http.body.uploads-directory")
  private Path rootLocation;

  //@PostConstruct
  public void init() throws StorageException {
    try {
      logger.info("Initializing storage service");
      Files.createDirectories(rootLocation);
      Files.createDirectory(rootLocation.resolve("csv/"));
      Files.createDirectory(rootLocation.resolve("mp4/"));
    } catch (IOException e) {
      logger.error("Could not initialize storage service", e);
      throw new StorageException("Failed to initialize the storage service.", e);
    }
  }

  public Path getRootLocation() {
    return rootLocation;
  }

  public void store(InputStream fileData, Path targetPath) throws StorageException {
    try {
      Path destinationFile = rootLocation.resolve(targetPath).normalize().toAbsolutePath();

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

  public Stream<Path> loadAll(Path dir) throws StorageException {
    try {
      return Files.walk(rootLocation.resolve(dir))
          .filter(path -> !Files.isDirectory(path))
          .map(rootLocation::relativize);
    } catch (IOException e) {
      logger.error("Could not list files", e);
      throw new FileNotFoundException("Could not list files", e);
    }
  }

  public Stream<Path> loadAll() throws StorageException {
    return loadAll(rootLocation);
  }

  public void delete(Path targetPath) {
    try {
      Files.delete(rootLocation.resolve(targetPath));
    } catch (IOException e) {
      logger.error("Could not delete file", e);
    }
  }

  // TODO: Does not regenerate csv/ or mp4/ 
  public void deleteAll(Path dir) throws StorageException {
    try {
      Files.walk(rootLocation.resolve(dir))
        .sorted(Comparator.reverseOrder())
        .forEach(file -> {
          try {
            Files.delete(file);
          } catch (IOException e) {
            logger.error("Could not delete file", e);
          }
        });
    } catch (Exception e) {
      logger.error("Could not delete files", e);
    }
  }

  public void deleteAll() throws StorageException {
    deleteAll(rootLocation);
  }
}
