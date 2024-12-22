package com.mcmasterbaja.services;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.stream.Stream;

import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import com.mcmasterbaja.exceptions.FileNotFoundException;
import com.mcmasterbaja.exceptions.StorageException;

import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped // Singleton I think
public class FileSystemStorageService implements StorageService {

  @Inject
  Logger logger;

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

  public Stream<Path> loadAll() {
    return loadAll(rootLocation);
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

// catch IOException
// a) -> throw FileNotFoundException
// - couldn't delete directory,
// - couldn't delete file,
// - couldn't list files in directory,
// - couldn't store file
