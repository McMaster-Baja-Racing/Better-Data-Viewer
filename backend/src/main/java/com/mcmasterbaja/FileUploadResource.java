package com.mcmasterbaja;

import com.mcmasterbaja.binary_csv.BinaryToCSV;
import com.mcmasterbaja.exceptions.StorageException;
import com.mcmasterbaja.services.StorageService;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.core.MediaType;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Paths;
import org.jboss.logging.Logger;
import org.jboss.resteasy.reactive.PartType;
import org.jboss.resteasy.reactive.RestForm;

@jakarta.ws.rs.Path("/upload")
public class FileUploadResource {

  @Inject Logger logger;
  @Inject StorageService storageService;

  @POST
  @jakarta.ws.rs.Path("/file")
  @Consumes(MediaType.MULTIPART_FORM_DATA)
  public String uploadFile(
      @RestForm("fileName") String fileName,
      @RestForm("fileData") @PartType(MediaType.APPLICATION_OCTET_STREAM) InputStream fileData) {

    logger.info("Uploading file: " + fileName);

    if (fileName.lastIndexOf('.') == -1) {
      throw new IllegalArgumentException("Invalid file name: " + fileName);
    }

    String fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();

    switch (fileExtension) {
      case "csv":
      case "mp4":
        storageService.store(fileData, Paths.get(fileExtension + "/" + fileName));
        break;

      case "mov":
        fileName = "mp4/" + fileName.substring(0, fileName.lastIndexOf('.') + 1) + "mp4";
        storageService.store(fileData, Paths.get(fileName));
        break;

      case "bin":
        String outputDir = storageService.load(Paths.get("csv")).toString();

        logger.info(
            "Parsing bin to: "
                + outputDir
                + "/"
                + fileName.substring(0, fileName.lastIndexOf('.'))
                + "/");

        try (InputStream input = fileData) { // try-with-resources, look it up if you don't know it
          BinaryToCSV.bytesToCSV(fileData.readAllBytes(), outputDir, fileName, true);
        } catch (IOException e) { // UnsatisfiedLinkError, IOException
          throw new StorageException("Failed to read bytes from: " + fileName, e);
        }
        break;

      default:
        try {fileData.close();} catch (IOException e) {throw new StorageException("Failed to close fileData", e);}
        throw new IllegalArgumentException("Invalid filetype: " + fileExtension);
    }

    return "File uploaded successfully";
  }
}
