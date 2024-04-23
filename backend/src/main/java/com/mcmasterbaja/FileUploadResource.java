package com.mcmasterbaja;

import com.mcmasterbaja.binary_csv.BinaryToCSV;
import com.mcmasterbaja.model.FileUploadForm;
import com.mcmasterbaja.storage.StorageService;
import com.mcmasterbaja.storage.exceptions.StorageException;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.io.IOException;
import java.nio.file.Paths;
import org.jboss.logging.Logger;
import org.jboss.resteasy.annotations.providers.multipart.MultipartForm;

@jakarta.ws.rs.Path("/upload")
public class FileUploadResource {

  @Inject Logger logger;
  @Inject StorageService storageService;

  @POST
  @jakarta.ws.rs.Path("/file")
  @Consumes(MediaType.MULTIPART_FORM_DATA)
  public Response uploadFile(@MultipartForm FileUploadForm form) {
    logger.info("Uploading file: " + form.fileName);

    String fileName = form.fileName;

    if (fileName.lastIndexOf('.') == -1) {
      throw new IllegalArgumentException("Invalid file name: "+ fileName);
    }

    String fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1);

    switch (fileExtension) {
      case "csv":
      case "mp4":
        storageService.store(form.fileData, Paths.get(fileExtension + "/" + fileName));
        break;

      case "mov":
        fileName = "mp4/" + fileName.substring(0, fileName.lastIndexOf('.') + 1) + "mp4";
        storageService.store(form.fileData, Paths.get(fileName));
        break;

      case "bin":
        String outputDir = storageService.load(Paths.get("csv")).toString();

        logger.info(
            "Parsing bin to: "
                + outputDir
                + "/"
                + fileName.substring(0, fileName.lastIndexOf('.'))
                + "/");

        try {
          BinaryToCSV.bytesToCSV(
              form.fileData.readAllBytes(),
              outputDir,
              fileName,
              true);
        } catch (IOException e) { // UnsatisfiedLinkError, IOException
          throw new StorageException("Failed to read bytes from: " + fileName, e);
        }
        break;

      default:
        throw new IllegalArgumentException("Invalid filetype: " + fileExtension);
    }

    return Response.ok("File uploaded successfully").build();
  }
}
