package com.mcmasterbaja;

import java.nio.file.Paths;
import java.nio.file.Path;

import org.jboss.logging.Logger;

import com.mcmasterbaja.storage.StorageService;

import jakarta.inject.Inject;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.core.Response;

@jakarta.ws.rs.Path("/delete")
public class FileDeleteResource {
  
  @Inject
  Logger logger;

  @Inject
  private StorageService storageService;

  // TODO: Deletes just the one file / one folder, not directories. Should be?
  @DELETE
  @jakarta.ws.rs.Path("/file/{filename}")
  public Response deleteFile(@PathParam("filename") String filename) {
    try {
      logger.info("Deleting file: " + filename);

      Path targetPath = Paths.get(filename);
      storageService.delete(targetPath);

      return Response.ok("File deleted successfully").build();
    } catch (Exception e) {
      return Response.serverError().entity("File deletion failed: " + e.getMessage()).build();
    }
  }

  // TODO: Only deletes all files, not directories. Should clean up directories?
  @DELETE
  @jakarta.ws.rs.Path("/all")
  public Response deleteAllFiles() {
    try {
      logger.info("Deleting all files");

      storageService.loadAll().forEach(storageService::delete);

      return Response.ok("All files deleted successfully").build();
    } catch (Exception e) {
      return Response.serverError().entity("File deletion failed: " + e.getMessage()).build();
    }
  }

  
}
