package com.mcmasterbaja;

import com.mcmasterbaja.model.FileInformation;
import com.mcmasterbaja.model.FileTimespan;
import com.mcmasterbaja.storage.FileMetadataService;
import com.mcmasterbaja.storage.StorageService;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
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
  public Response getAllFiles() {
    logger.info("Getting all files");

    List<String> filenames =
        storageService.loadAll().map(Path::toString).collect(Collectors.toList());

    logger.info("Files include: " + filenames);
    return Response.ok(filenames).build();
  }

  @GET
  @jakarta.ws.rs.Path("/{filekey}")
  public Response getFile(@PathParam("filekey") String filekey) {
    logger.info("Getting file: " + filekey);

    Path targetPath = Paths.get(filekey);
    File file = storageService.load(targetPath).toFile();

    return Response.ok(file, MediaType.APPLICATION_OCTET_STREAM)
        .header("Content-Disposition", "attachment; filename=\"" + file.getName() + "\"")
        .build();
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
                        path.toString().replace("\\", "/"), // TODO: Is this necesary?
                        fileMetadataService.readHeaders(path),
                        path.toFile().lastModified()))
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
            targetPath.toString().replace("\\", "/"), // TODO: Is this necessary?
            fileMetadataService.readHeaders(targetPath),
            targetPath.toFile().lastModified());

    return fileInformation;
  }

  @GET
  @jakarta.ws.rs.Path("/information/folder/{folderkey}")
  public List<FileInformation> getInformationForFolder(@PathParam("folderkey") String folderkey) {
    logger.info("Getting file information for folder: " + folderkey);

    Path targetPath = Paths.get(folderkey);

    List<FileInformation> fileInformationList =
        storageService
            .loadAll(targetPath)
            .map(
                path ->
                    new FileInformation(
                        targetPath.relativize(path).toString(),
                        fileMetadataService.readHeaders(path),
                        path.toFile().lastModified()))
            .collect(Collectors.toList());

    return fileInformationList;
  }

  @GET
  @jakarta.ws.rs.Path("/timespan/folder/{folderkey}")
  public List<FileTimespan> getTimespan(@PathParam("folderkey") String folderkey) {
    logger.info("Getting timespan for folder: " + folderkey);

    List<FileTimespan> timespans = new ArrayList<>();
    Stream<Path> paths = storageService.loadAll(Paths.get(folderkey));

    switch (folderkey) {
      case "csv":
        // Holds the parent folder and the zero time
        Object[] container = {null, null};
        paths.forEach(
            path -> {
              logger.info("Getting timespan for file: " + path.toString());
              Path parent = path.getParent();
              if (parent.toString() != "csv") {
                if (fileMetadataService.canComputeTimespan(parent)) {
                  // Updates the parent folder and zero time if the parent folder changes to avoid
                  // recalculating the zero time
                  if (container[0] != parent) {
                    container[0] = parent;
                    container[1] = fileMetadataService.getZeroTime((Path) container[0]);
                  }
                  // Get the path and filename of each file and print it
                  LocalDateTime[] timespan =
                      fileMetadataService.getTimespan(path, (LocalDateTime) container[1]);
                  logger.info("Timespan: " + timespan[0] + " - " + timespan[1]);
                  timespans.add(
                      new FileTimespan(
                          path.toString().replace("\\", "/"), timespan[0], timespan[1]));
                }
              }
            });
        break;
      case "mp4":
        paths.forEach(
            path -> {
              // Get the path and filename of each file and print it
              LocalDateTime[] timespan = fileMetadataService.getTimespan(path, null);
              timespans.add(
                  new FileTimespan(path.toString().replace("\\", "/"), timespan[0], timespan[1]));
            });
        break;
      default:
        throw new IllegalArgumentException("Invalid folder name");
    }

    return timespans;
  }
}
