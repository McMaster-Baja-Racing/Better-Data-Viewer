package com.mcmasterbaja;

import org.jboss.resteasy.annotations.providers.multipart.MultipartForm;

import com.mcmasterbaja.binary_csv.BinaryToCSV;
import com.mcmasterbaja.model.FileUploadForm;
import com.mcmasterbaja.storage.StorageService;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.io.ByteArrayOutputStream;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.jboss.logging.Logger;


@jakarta.ws.rs.Path("/upload")
public class FileUploadResource {

    @Inject
    Logger logger;

    @Inject
    StorageService storageService;

    @POST
    @jakarta.ws.rs.Path("/file")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response uploadFile(@MultipartForm FileUploadForm form) {
      try {
        logger.info("Uploading file: " + form.fileName);

        String fileName = form.fileName;
      
        if (fileName.lastIndexOf('.') == -1) {
          return Response.status(Response.Status.BAD_REQUEST).entity("Invalid file name").build();
        }

        String fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1);
        fileName = fileExtension + "/" + fileName;

        switch (fileExtension) {
          case "csv":
          case "mp4":
            storageService.store(form.fileData, Paths.get(fileName));
            break;

          case "bin":
            fileName = fileName.substring(4, fileName.length() - 4) + "/";
            logger.info("File name: " + fileName);

            //storageService.store(form.fileData, Paths.get(fileName));

            logger.info("Absolute location: " + storageService.getRootLocation().resolve(fileName).toString() + "/");

            //logger.info("Bytes: " + form.fileData.readAllBytes().length);

            try {
              BinaryToCSV.bytesToCSV(
                form.fileData.readAllBytes(),
                storageService.getRootLocation().resolve(fileName).toString() + "/",
                storageService.getRootLocation().resolve(fileName).toString(),
                true);
            } catch (UnsatisfiedLinkError e) {
              return Response.serverError().entity("File upload failed: " + e.getMessage()).build();
            }
            
            storageService.delete(Paths.get(fileName));
            break;

          case "mov":
            fileName = "mp4" + fileName.substring(3, fileName.lastIndexOf('.') + 1) + "mp4";
            storageService.store(form.fileData, Paths.get(fileName));
            break;

          default:
            return Response.status(Response.Status.BAD_REQUEST).entity("Invalid file type").build();
        }

        return Response.ok("File uploaded successfully").build();
      } catch (Exception e) {
        return Response.serverError().entity("File upload failed: " + e.getMessage()).build();
      }
    }


}