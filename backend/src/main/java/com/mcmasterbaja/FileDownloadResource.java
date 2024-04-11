package com.mcmasterbaja;

import com.mcmasterbaja.storage.StorageService;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.nio.file.Paths;
import java.io.File;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Collectors;
import org.jboss.logging.Logger;
import jakarta.ws.rs.Produces;

@jakarta.ws.rs.Path("/files")
public class FileDownloadResource {

    @Inject
    Logger logger;

    @Inject
    private StorageService storageService;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllFiles() {
      logger.info("Getting all files");

      List<String> filenames = storageService.loadAll()
        .map(Path::toString)
        .collect(Collectors.toList());

      logger.info("Files include: " + filenames);
      return Response.ok(filenames).build();
    }

    @GET
    @jakarta.ws.rs.Path("/{filename}")
    public Response getFile(@PathParam("filename") String filename) {
      logger.info("Getting file: " + filename);

      Path targetPath = Paths.get(filename);
      File file = storageService.load(targetPath).toFile();

      return Response.ok(file, MediaType.APPLICATION_OCTET_STREAM)
        .header("Content-Disposition", "attachment; filename=\"" + file.getName() + "\"")
        .build();
    }
}