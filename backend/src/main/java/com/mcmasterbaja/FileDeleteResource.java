package com.mcmasterbaja;

import com.mcmasterbaja.services.StorageService;
import jakarta.inject.Inject;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.PathParam;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.jboss.logging.Logger;

@jakarta.ws.rs.Path("/delete")
public class FileDeleteResource {

  @Inject Logger logger;
  @Inject StorageService storageService;

  @DELETE
  @jakarta.ws.rs.Path("/file/{filekey}")
  public void deleteFile(@PathParam("filekey") String filekey) {
    logger.info("Deleting file: " + filekey);

    Path targetPath = Paths.get(filekey);
    storageService.delete(targetPath);

    return;
  }

  @DELETE
  @jakarta.ws.rs.Path("/folder/{folderkey}")
  public void deleteFolder(@PathParam("folderkey") String folderkey) {
    logger.info("Deleting folder: " + folderkey);

    Path targetPath = Paths.get(folderkey);
    storageService.deleteAll(targetPath);

    return;
  }

  @DELETE
  @jakarta.ws.rs.Path("/all")
  public void deleteAllFiles() {
    logger.info("Deleting all files");

    storageService.deleteAll();
    storageService.init();

    return;
  }
}
