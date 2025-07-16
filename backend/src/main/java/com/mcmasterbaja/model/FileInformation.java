package com.mcmasterbaja.model;

import java.nio.file.Path;
import java.time.Instant;

import lombok.ToString;

// This class represents the data structure that is used to send information about the file through
// to the front end
// In order to send information, there must be either public getters or public variables
@ToString
public class FileInformation {

  public String key;
  public String fileName;
  public String[] fileHeaders;
  public long size;
  public Instant uploadDate;

  public FileInformation(String key, String fileName, String[] fileHeaders, long size, Instant uploadDate) {
    this.key = key;
    this.fileName = fileName;
    this.fileHeaders = fileHeaders;
    this.size = size;
    this.uploadDate = uploadDate;
  }

  public FileInformation(Path key, String fileName, String[] fileHeaders, long size, Instant uploadDate) {
    this.key = key.toString().replace("\\", "/");
    this.fileName = fileName;
    this.fileHeaders = fileHeaders;
    this.size = size;
    this.uploadDate = uploadDate;
  }
}
