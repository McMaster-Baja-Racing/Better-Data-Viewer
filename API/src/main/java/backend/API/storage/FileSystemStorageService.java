// Author: Kai Arseneau
// This code is a file storage service implemented in Java using the Spring framework.
// The service implements the StorageService interface and uses the file system to store and
// retrieve files.
// The root location of the files is specified in a StorageProperties class that is passed to the
// constructor.
// The service provides methods to store, load, and delete files, as well as to read the headers of
// a file.
// Exceptions are thrown in the case of errors, such as IOException or StorageException, specified
// in the StorageException class.

package backend.API.storage;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.DoubleSummaryStatistics;
import java.util.stream.Stream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileSystemStorageService implements StorageService {

  private final Path rootLocation;

  @Autowired
  public FileSystemStorageService(StorageProperties properties) {

    if (properties.getLocation().trim().length() == 0) {
      throw new StorageException("File upload location can not be Empty.");
    }

    this.rootLocation = Paths.get(properties.getLocation());
  }

  @Override
  public void store(MultipartFile file) {
    try {
      if (file.isEmpty()) {
        throw new StorageException("Failed to store empty file.");
      }
      Path destinationFile =
          this.rootLocation
              .resolve(Paths.get(file.getOriginalFilename()))
              .normalize()
              .toAbsolutePath();
      if (!destinationFile.getParent().equals(this.rootLocation.toAbsolutePath())) {
        // This is a security check
        throw new StorageException("Cannot store file outside current directory.");
      }
      try (InputStream inputStream = file.getInputStream()) {
        Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
      }
    } catch (IOException e) {
      throw new StorageException("Failed to store file.", e);
    }
  }

  @Override
  public Stream<Path> loadAll() {
    try {
      return Files.walk(this.rootLocation, 2) // optional depth parameter
          .filter(path -> !Files.isDirectory(path))
          .map(this.rootLocation::relativize);

    } catch (IOException e) {
      throw new StorageException("Failed to read stored files", e);
    }
  }

  @Override
  public Path load(String filename) {
    return rootLocation.resolve(filename);
  }

  @Override
  public Resource loadAsResource(String filename) {
    try {
      Path file = load(filename);
      Resource resource = new UrlResource(file.toUri());
      if (resource.exists() || resource.isReadable()) {
        return resource;
      } else {
        throw new StorageFileNotFoundException("Could not read file: " + filename);
      }
    } catch (MalformedURLException e) {
      throw new StorageFileNotFoundException("Could not read file: " + filename, e);
    }
  }

  @Override
  public void deleteAll() {
    FileSystemUtils.deleteRecursively(rootLocation.toFile());
  }

  @Override
  public void init() {
    try {
      Files.createDirectories(rootLocation);
    } catch (IOException e) {
      throw new StorageException("Could not initialize storage", e);
    }
  }

  @Override
  public String readHeaders(String filename) {
    // Basically read the first line of the file and return it
    try {
      Path file = load(filename);
      String headers = Files.lines(file).findFirst().get();
      return headers;
    } catch (IOException e) {
      e.printStackTrace();
      return null;
    }
  }

  @Override
  public void delete(String filename) {
    try {
      Path file = load(filename);
      Files.delete(file);
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  @Override
  public void copyFile(String filename, String newFilename) {
    try {
      Path file = load(filename);
      Path newFile = load(newFilename);
      Files.copy(file, newFile, StandardCopyOption.REPLACE_EXISTING);
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  @Override
  public String getMaxMin(String filename, String headerName) {
    // Find the maximum and minimum values in the file for a given column
    try {
      // First find the index of the column
      String[] headerArray = readHeaders(filename).split(",");
      int index = -1;

      for (int i = 0; i < headerArray.length; i++) {
        if (headerArray[i].equals(headerName)) {
          index = i;
          break;
        }
      }

      if (index == -1) {
        return null;
      }

      // Now find the max and min values

      Path file = load(filename);
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

        return min + "," + max;
      }

    } catch (IOException e) {
      e.printStackTrace();
      return null;
    }
  }
}
