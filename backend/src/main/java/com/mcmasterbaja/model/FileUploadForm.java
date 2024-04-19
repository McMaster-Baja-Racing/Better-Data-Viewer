package com.mcmasterbaja.model;

import jakarta.ws.rs.FormParam;
import jakarta.ws.rs.core.MediaType;
import java.io.InputStream;
import org.jboss.resteasy.annotations.providers.multipart.PartType;

public class FileUploadForm {

  @FormParam("fileName")
  @PartType(MediaType.TEXT_PLAIN)
  public String fileName;

  @FormParam("fileData")
  @PartType(MediaType.APPLICATION_OCTET_STREAM)
  public InputStream fileData;
}
