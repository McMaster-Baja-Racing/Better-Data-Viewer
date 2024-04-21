package com.mcmasterbaja.model;

import java.nio.file.Path;

// This class represents the data structure that is used to send information about the file through
// to the front end
// In order to send information, there must be either public getters or public variables
public class FileInformation {

  public String key;
  public String[] fileHeaders;
  public long size;

  public FileInformation(String key, String[] fileHeaders, long size) {
    this.key = key;
    this.fileHeaders = fileHeaders;
    this.size = size;
  }

  public FileInformation(Path key, String[] fileHeaders, long size) {
    this.key = key.toString().replace("\\", "/");
    this.fileHeaders = fileHeaders;
    this.size = size;
  }

  public String toString() {
    StringBuilder headers = new StringBuilder();
    for (String fileHeader : fileHeaders) {
      headers.append(fileHeader).append(", ");
    }
    return "File Name: " + key + "\nFile Headers: " + headers + "\nFile Size: " + size;
  }
}
