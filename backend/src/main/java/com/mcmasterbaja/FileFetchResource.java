package com.mcmasterbaja;

import com.mcmasterbaja.exceptions.FileNotFoundException;
import com.mcmasterbaja.exceptions.InvalidInputFileException;
import com.mcmasterbaja.model.FileInformation;
import com.mcmasterbaja.model.FileTimespan;
import com.mcmasterbaja.services.FileMetadataService;
import com.mcmasterbaja.services.StorageService;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.jboss.logging.Logger;

@jakarta.ws.rs.Path("/files") // Use full package name to avoid conflict with java.nio.file.Path
public class FileFetchResource {

  @Inject Logger logger;
  @Inject StorageService storageService;
  @Inject FileMetadataService fileMetadataService;

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  public List<String> getAllFiles() {
    logger.info("Getting all files");

    List<String> fileNames =
        storageService.loadAll().map(Path::toString).collect(Collectors.toList());

    return fileNames;
  }

  @GET
  @jakarta.ws.rs.Path("/{filekey}")
  public File getFile(@PathParam("filekey") String filekey) {
    logger.info("Getting file: " + filekey);
    Path targetPath = addTypeFolder(filekey);
    if (!Files.exists(targetPath)) {
      throw new FileNotFoundException("File not found: " + filekey);
    }
    File file = storageService.load(targetPath).toFile();

    return file;
  }

  @GET
  @jakarta.ws.rs.Path("/information")
  public List<FileInformation> getInformation() {
    logger.info("Getting all file information");

    // Map of parent folders to zero times to avoid recalculating the zero time
    Map<Path, LocalDateTime> zeroTimeMap = new HashMap<>();

    List<FileInformation> fileInformation =
        storageService
            .loadAll()
            .map(
                path -> {
                  try {
                    LocalDateTime[] timespan = getTimespanForFile(path, zeroTimeMap);
                    return new FileInformation(
                        path,
                        fileMetadataService.readHeaders(path),
                        fileMetadataService.getSize(path),
                        fileMetadataService.getUploadDate(path),
                        timespan[0],
                        timespan[1]
                      );
                  } catch (Exception e) {
                    logger.warn("Could not get information for file: " + path + ". Error: " + e.getMessage());
                    return null;
                  }
                })
            .filter(fileInfo -> fileInfo != null)
            .collect(Collectors.toList());

    return fileInformation;
  }

  @GET
  @jakarta.ws.rs.Path("/information/{filekey}")
  public FileInformation getInformation(@PathParam("filekey") String filekey) {
    logger.info("Getting file information for: " + filekey);

    Path targetPath = Paths.get(filekey);
    
    // Map of parent folders to zero times to avoid recalculating the zero time
    Map<Path, LocalDateTime> zeroTimeMap = new HashMap<>();
    LocalDateTime[] timespan = getTimespanForFile(targetPath, zeroTimeMap);

    FileInformation fileInformation =
        new FileInformation(
            targetPath,
            fileMetadataService.readHeaders(targetPath),
            fileMetadataService.getSize(targetPath),
            fileMetadataService.getUploadDate(targetPath),
            timespan[0],
            timespan[1]
          );

    return fileInformation;
  }

  @GET
  @jakarta.ws.rs.Path("/information/folder/{folderkey}")
  public List<FileInformation> getInformationForFolder(@PathParam("folderkey") String folderkey) {
    logger.info("Getting file information for folder: " + folderkey);

    Path folderPath = Paths.get(folderkey);
    
    // Map of parent folders to zero times to avoid recalculating the zero time
    Map<Path, LocalDateTime> zeroTimeMap = new HashMap<>();

    List<FileInformation> fileInformationList =
        storageService
            .loadAll(folderPath)
            .map(
                path -> {
                  try {
                    LocalDateTime[] timespan = getTimespanForFile(path, zeroTimeMap);
                    return new FileInformation(
                        folderPath.relativize(path),
                        fileMetadataService.readHeaders(path),
                        fileMetadataService.getSize(path),
                        fileMetadataService.getUploadDate(path),
                        timespan[0],
                        timespan[1]
                    );
                  } catch (Exception e) {
                    logger.warn("Could not get information for file: " + path + ". Error: " + e.getMessage());
                    return null;
                  }
                })
            .filter(fileInfo -> fileInfo != null)
            .collect(Collectors.toList());

    return fileInformationList;
  }

  @GET
  @jakarta.ws.rs.Path("/listBins")
  public List<FileInformation> getFolders() {
    logger.info("Getting file information for CSV folders");

    Path csvDir = Paths.get("csv");

    List<FileInformation> fileInformationList =
        storageService
            .loadDirectories(csvDir)
            .map(
                relativeFolderPath -> {
                  try {
                    // Resolve the folder's full path by prepending the csv directory.
                    Path fullFolderPath = csvDir.resolve(relativeFolderPath);

                    // Calculate total size of all files within this folder.
                    long totalSize =
                        storageService
                            .loadAll(fullFolderPath)
                            .map(filePath -> fileMetadataService.getSize(filePath))
                            .reduce(0L, Long::sum);

                    // Create a folder key relative to the csvDir.
                    String folderKey =
                        csvDir.relativize(fullFolderPath).toString().replace("\\", "/");

                    // Calculate folder timespan if possible
                    LocalDateTime start = null;
                    LocalDateTime end = null;
                    if (fileMetadataService.canComputeTimespan(fullFolderPath)) {
                      LocalDateTime zeroTime = fileMetadataService.getZeroTime(fullFolderPath);
                      Map<Path, LocalDateTime> zeroTimeMap = new HashMap<>();
                      zeroTimeMap.put(fullFolderPath, zeroTime);
                      
                      // Find the earliest start and latest end times from all files in the folder
                      List<LocalDateTime[]> timespans = storageService
                          .loadAll(fullFolderPath)
                          .map(path -> getTimespanForFile(path, zeroTimeMap))
                          .filter(timespan -> timespan[0] != null && timespan[1] != null)
                          .collect(Collectors.toList());
                      
                      if (!timespans.isEmpty()) {
                        start = timespans.stream().map(ts -> ts[0]).min(LocalDateTime::compareTo).orElse(null);
                        end = timespans.stream().map(ts -> ts[1]).max(LocalDateTime::compareTo).orElse(null);
                      }
                    }

                    // Return a FileInformation with null headers and the aggregated size.
                    return new FileInformation(
                      folderKey,
                      null, 
                      totalSize,
                      fileMetadataService.getUploadDate(fullFolderPath),
                      start,
                      end
                    );
                  } catch (Exception e) {
                    logger.warn("Could not get information for folder: " + relativeFolderPath + ". Error: " + e.getMessage());
                    return null;
                  }
                })
            .filter(fileInfo -> fileInfo != null)
            .collect(Collectors.toList());

    return fileInformationList;
  }

  @GET
  @jakarta.ws.rs.Path("/timespan/folder/{folderkey}")
  public List<FileTimespan> getTimespan(@PathParam("folderkey") String folderkey) {
    logger.info("Getting timespan for folder: " + folderkey);

    Path folderPath = Paths.get(folderkey);
    List<FileTimespan> timespans = new ArrayList<>();
    Stream<Path> paths = storageService.loadAll(folderPath);

    switch (folderkey) {
      case "csv":
        // Map of parent folders to zero times to avoid recalculating the zero time
        Map<Path, LocalDateTime> zeroTimeMap = new HashMap<>();
        paths.forEach(
            path -> {
              try {
                Path parent = path.getParent();
                if (fileMetadataService.canComputeTimespan(parent)) {
                  // Add the zero time to the map if the parent folder has not been analyzed
                  zeroTimeMap.putIfAbsent(parent, fileMetadataService.getZeroTime(parent));

                  // Comput the timespan of the file and add it to the list
                  LocalDateTime[] timespan =
                      fileMetadataService.getTimespan(path, zeroTimeMap.get(parent));
                  timespans.add(
                      new FileTimespan(folderPath.relativize(path), timespan[0], timespan[1]));
                }
              } catch (Exception e) {
                logger.warn("Could not get timespan for CSV file: " + path + ". Error: " + e.getMessage());
              }
            });
        break;

      case "mp4":
        paths.forEach(
            path -> {
              try {
                LocalDateTime[] timespan = fileMetadataService.getTimespan(path, null);
                timespans.add(
                    new FileTimespan(folderPath.relativize(path), timespan[0], timespan[1]));
              } catch (Exception e) {
                logger.warn("Could not get timespan for MP4 file: " + path + ". Error: " + e.getMessage());
              }
            });
        break;

      default:
        throw new InvalidInputFileException("Invalid folder name");
    }

    return timespans;
  }

  private LocalDateTime[] getTimespanForFile(Path path, Map<Path, LocalDateTime> zeroTimeMap) {
    Path parent = path.getParent();
    String typeFolder = fileMetadataService.getTypeFolder(path);
    
    switch (typeFolder) {
      case "csv":
        if (fileMetadataService.canComputeTimespan(parent)) {
          // Add the zero time to the map if the parent folder has not been analyzed
          zeroTimeMap.putIfAbsent(parent, fileMetadataService.getZeroTime(parent));
          return fileMetadataService.getTimespan(path, zeroTimeMap.get(parent));
        }
        break;
      case "mp4":
        return fileMetadataService.getTimespan(path, null);
      default:
        break;
    }
    return new LocalDateTime[]{null, null};
  }

  private Path addTypeFolder(String fileKey) {
    String typeFolder = fileMetadataService.getTypeFolder(Paths.get(fileKey));
    return storageService.load(Paths.get(typeFolder)).resolve(fileKey);
  }
}
