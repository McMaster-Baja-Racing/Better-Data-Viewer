package com.mcmasterbaja;

import com.mcmasterbaja.storage.StorageService;

import jakarta.inject.Inject;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.core.Response;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.jboss.logging.Logger;

@jakarta.ws.rs.Path("/delete")
public class FileDeleteResource {

  @Inject Logger logger;
  @Inject StorageService storageService;

  @DELETE
  @jakarta.ws.rs.Path("/file/{filekey}")
  public Response deleteFile(@PathParam("filekey") String filekey) {
    logger.info("Deleting file: " + filekey);

    Path targetPath = Paths.get(filekey);
    storageService.delete(targetPath);

    return Response.ok("File deleted successfully").build();
  }

  @DELETE
  @jakarta.ws.rs.Path("/folder/{folderkey}")
  public Response deleteFolder(@PathParam("folderkey") String folderkey) {
    logger.info("Deleting folder: " + folderkey);

    Path targetPath = Paths.get(folderkey);
    storageService.deleteAll(targetPath);

    return Response.ok("All files deleted successfully").build();
  }

  @DELETE
  @jakarta.ws.rs.Path("/all")
  public Response deleteAllFiles() {
    logger.info("Deleting all files");

    storageService.deleteAll();
    storageService.init();

    return Response.ok("All files deleted successfully").build();
  }
}
