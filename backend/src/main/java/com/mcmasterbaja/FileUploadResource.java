package com.mcmasterbaja;

import org.jboss.resteasy.annotations.providers.multipart.MultipartForm;

import com.mcmasterbaja.model.FileUploadForm;
import com.mcmasterbaja.storage.StorageService;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.nio.file.Paths;
import org.jboss.logging.Logger;


@Path("/upload")
public class FileUploadResource {

    @Inject
    Logger logger;

    @Inject
    StorageService storageService;

    @POST
    @Path("/file")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response uploadFile(@MultipartForm FileUploadForm form) {
      try {
        logger.info("Uploading file: " + Paths.get(form.fileName).toString());

        storageService.store(form.fileData, Paths.get(form.fileName));

        return Response.ok("File uploaded successfully").build();
      } catch (Exception e) {
        return Response.serverError().entity("File upload failed: " + e.getMessage()).build();
      }
    }


}