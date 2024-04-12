package com.mcmasterbaja;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.jboss.logging.Logger;

import com.mcmasterbaja.analyzer.Analyzer;
import com.mcmasterbaja.analyzer.AnalyzerFactory;
import com.mcmasterbaja.model.AnalyzerParams;
import com.mcmasterbaja.storage.StorageService;
import jakarta.inject.Inject;
import jakarta.ws.rs.BeanParam;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.core.Response;

@jakarta.ws.rs.Path("/analyze")
public class FileAnalyzeResource {

  @Inject
  Logger logger;

  @Inject
  private StorageService storageService;

  @GET
  public Response runAnalyzer(@BeanParam AnalyzerParams params) {

    logger.info("Running analyzer with params: " + params.toString());

    if (!params.isValid()) {
      return Response.status(Response.Status.BAD_REQUEST).entity("Invalid parameters").build();
    }

    // Update input files with root location and generate output file names (we don't do output files yet)
    params.updateInputFiles(storageService.getRootLocation());
    params.generateOutputFileNames();

    Analyzer analyzer = AnalyzerFactory.createAnalyzer(params);

    if (analyzer != null) {
      try {
        analyzer.analyze();
      } catch (Exception e) {
        logger.error("Error running analyzer", e);
        return Response.serverError().entity("Error running analyzer").build();
      }
    }

    Path targetPath = Paths.get(params.getOutputFiles()[0]);
    File file = storageService.load(targetPath).toFile();

    return Response.ok(file, "application/octet-stream")
        .header("Content-Disposition", "attachment; filename=\"" + file.getName() + "\"").build();
  }
  
}
