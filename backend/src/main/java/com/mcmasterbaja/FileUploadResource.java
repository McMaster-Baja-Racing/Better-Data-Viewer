package com.mcmasterbaja;

import java.io.InputStream;
import java.nio.file.Paths;

import org.jboss.logging.Logger;
import org.jboss.resteasy.reactive.PartType;
import org.jboss.resteasy.reactive.RestForm;

import com.mcmasterbaja.annotations.OnStorageException;
import com.mcmasterbaja.binary_csv.BinaryToCSV;
import com.mcmasterbaja.services.StorageService;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.core.MediaType;
import lombok.SneakyThrows;

@jakarta.ws.rs.Path("/upload")
public class FileUploadResource {

  @Inject Logger logger;
  @Inject StorageService storageService;

  @POST
  @jakarta.ws.rs.Path("/file")
  @Consumes(MediaType.MULTIPART_FORM_DATA)
  @OnStorageException
  @SneakyThrows
  public void uploadFile(
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
        }
        break;

      default:
        fileData.close();
        throw new IllegalArgumentException("Invalid filetype: " + fileExtension);
    }
  }
}


// invalid file -> IllegalArgumentException
//        - name
//        - type