package com.mcmasterbaja;

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

  // TODO: What exception is thrown when it can't find the file?
  @GET
  @jakarta.ws.rs.Path("/{filekey}")
  public File getFile(@PathParam("filekey") String filekey) {
    logger.info("Getting file: " + filekey);

    Path targetPath = addTypeFolder(filekey);
    File file = storageService.load(targetPath).toFile();

    return file;
  }

  @GET
  @jakarta.ws.rs.Path("/information")
  public List<FileInformation> getInformation() {
    logger.info("Getting all file information");

    List<FileInformation> fileInformation =
        storageService
            .loadAll()
            .map(
                path ->
                    new FileInformation(
                        path,
                        fileMetadataService.readHeaders(path),
                        fileMetadataService.getSize(path)))
            .collect(Collectors.toList());

    return fileInformation;
  }

  @GET
  @jakarta.ws.rs.Path("/information/{filekey}")
  public FileInformation getInformation(@PathParam("filekey") String filekey) {
    logger.info("Getting file information for: " + filekey);

    Path targetPath = Paths.get(filekey);

    FileInformation fileInformation =
        new FileInformation(
            targetPath,
            fileMetadataService.readHeaders(targetPath),
            fileMetadataService.getSize(targetPath));

    return fileInformation;
  }

  @GET
  @jakarta.ws.rs.Path("/information/folder/{folderkey}")
  public List<FileInformation> getInformationForFolder(@PathParam("folderkey") String folderkey) {
    logger.info("Getting file information for folder: " + folderkey);

    Path folderPath = Paths.get(folderkey);

    List<FileInformation> fileInformationList =
        storageService
            .loadAll(folderPath)
            .map(
                path ->
                    new FileInformation(
                        folderPath.relativize(path),
                        fileMetadataService.readHeaders(path),
                        fileMetadataService.getSize(path)))
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
            });
        break;

      case "mp4":
        paths.forEach(
            path -> {
              LocalDateTime[] timespan = fileMetadataService.getTimespan(path, null);
              timespans.add(
                  new FileTimespan(folderPath.relativize(path), timespan[0], timespan[1]));
            });
        break;

      default:
        throw new IllegalArgumentException("Invalid folder name");
    }

    return timespans;
  }

  private Path addTypeFolder(String fileKey) {
    String typeFolder = fileMetadataService.getTypeFolder(Paths.get(fileKey));
    return storageService.load(Paths.get(typeFolder)).resolve(fileKey);
  }
}
