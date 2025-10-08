package com.mcmasterbaja;

import com.garmin.fit.DateTime;
import com.garmin.fit.Decode;
import com.garmin.fit.FitRuntimeException;
import com.garmin.fit.MesgBroadcaster;
import com.garmin.fit.RecordMesg;
import com.garmin.fit.RecordMesgListener;
import com.mcmasterbaja.binary_csv.BinaryToCSV;
import com.mcmasterbaja.exceptions.InvalidInputFileException;
import com.mcmasterbaja.exceptions.StorageException;
import com.mcmasterbaja.services.StorageService;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.core.MediaType;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
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
  public void uploadFile(
      @RestForm("fileName") String fileName,
      @RestForm("fileData") @PartType(MediaType.APPLICATION_OCTET_STREAM) InputStream fileData) {

    logger.info("Uploading file: " + fileName);

    if (fileName.lastIndexOf('.') == -1) {
      throw new InvalidInputFileException("Invalid file name: " + fileName);
    }

    String fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();

    switch (fileExtension) {
      case "csv":
        Path csvPath = Paths.get("csv", fileName);
        storageService.store(fileData, csvPath);
        break;
      case "mp4":
        storageService.store(fileData, Paths.get(fileExtension + "/" + fileName));
        break;

      case "mov":
        fileName = "mp4/" + fileName.substring(0, fileName.lastIndexOf('.') + 1) + "mp4";
        storageService.store(fileData, Paths.get(fileName));
        break;

      case "bin":
        String outputDir = storageService.load(Paths.get("csv")).toString();
        try (InputStream input = fileData) {
          BinaryToCSV.bytesToCSV(input.readAllBytes(), outputDir, fileName, true);
        } catch (IOException e) {
          throw new StorageException("Failed to read bytes from: " + fileName, e);
        }
        break;

      case "fit":
        // Prepare output directory csv/<FitName>
        Path csvRoot = storageService.load(Paths.get("csv"));
        String fitName = fileName.substring(0, fileName.lastIndexOf('.'));
        Path fitDir = csvRoot.resolve(fitName);
        try {
          Files.createDirectories(fitDir);
        } catch (IOException e) {
          throw new StorageException("Failed to create directory: " + fitDir, e);
        }

        // Read FIT file bytes
        byte[] fitBytes;
        try (InputStream in = fileData) {
          fitBytes = in.readAllBytes();
        } catch (IOException e) {
          throw new StorageException("Failed to read FIT file bytes: " + fileName, e);
        }

        // Decode FIT records
        List<RecordMesg> records = new ArrayList<>();
        try {
          Decode decoder = new Decode();
          MesgBroadcaster broadcaster = new MesgBroadcaster(decoder);
          broadcaster.addListener((RecordMesgListener) records::add);
          decoder.read(new java.io.ByteArrayInputStream(fitBytes), broadcaster);
        } catch (FitRuntimeException e) {
          throw new StorageException("Error parsing FIT file: " + fileName, e);
        }

        // Build CSV contents
        String header = "Timestamp (ms),%s\n";
        StringBuilder latCsv = new StringBuilder(String.format(header, "GPS LATITUDE"));
        StringBuilder lonCsv = new StringBuilder(String.format(header, "GPS LONGITUDE"));
        StringBuilder speedCsv = new StringBuilder(String.format(header, "GPS SPEED"));

        for (RecordMesg rec : records) {
          // Convert FIT timestamp to Java epoch ms
          DateTime dt = rec.getTimestamp();
          if (dt != null) {
            long tsMs = dt.getDate().getTime();

            if (rec.getPositionLat() != null) {
              double lat = rec.getPositionLat().doubleValue() * (180.0 / Math.pow(2, 31));
              latCsv.append(tsMs).append(',').append(lat).append('\n');
            }
            if (rec.getPositionLong() != null) {
              double lon = rec.getPositionLong().doubleValue() * (180.0 / Math.pow(2, 31));
              lonCsv.append(tsMs).append(',').append(lon).append('\n');
            }
            if (rec.getSpeed() != null) {
              double speedKmh = rec.getSpeed().doubleValue() * 3.6;
              speedCsv.append(tsMs).append(',').append(speedKmh).append('\n');
            }
          }
        }

        // Store the CSV files
        try (InputStream latStream =
                new java.io.ByteArrayInputStream(
                    latCsv.toString().getBytes(StandardCharsets.UTF_8));
            InputStream lonStream =
                new java.io.ByteArrayInputStream(
                    lonCsv.toString().getBytes(StandardCharsets.UTF_8));
            InputStream speedStream =
                new java.io.ByteArrayInputStream(
                    speedCsv.toString().getBytes(StandardCharsets.UTF_8))) {
          storageService.store(latStream, fitDir.resolve("GPS LATITUDE.csv"));
          storageService.store(lonStream, fitDir.resolve("GPS LONGITUDE.csv"));
          storageService.store(speedStream, fitDir.resolve("GPS SPEED.csv"));
        } catch (IOException e) {
          throw new StorageException("Failed to store CSV files for FIT: " + fileName, e);
        }
        break;

      default:
        try {
          fileData.close();
        } catch (IOException e) {
          throw new StorageException("Failed to close fileData", e);
        }
        throw new IllegalArgumentException("Invalid filetype: " + fileExtension);
    }
  }
}
