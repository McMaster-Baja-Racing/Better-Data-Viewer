package com.mcmasterbaja.model;

import java.nio.file.Path;
import java.time.LocalDateTime;

import lombok.ToString;

// This class represents the data structure that is used to send information about the file through
// to the front end
// In order to send information, there must be either public getters or public variables
@ToString
public class FileInformation {

  public String key;
  public String name;
  public String extension;
  public String[] headers;
  public long size;
  public LocalDateTime date;
  public LocalDateTime start;
  public LocalDateTime end;

  public FileInformation(String key, String[] headers, long size, LocalDateTime date, LocalDateTime start, LocalDateTime end) {
    this.key = key;
    this.name = key.substring(key.lastIndexOf('/') + 1);
    this.extension = key.substring(key.lastIndexOf('.') + 1);
    this.headers = headers;
    this.size = size;
    this.date = date;
    this.start = start;
    this.end = end;
  }

  public FileInformation(Path key, String[] headers, long size, LocalDateTime date, LocalDateTime start, LocalDateTime end) {
    this.key = key.toString().replace("\\", "/");
    this.name = key.getFileName().toString();
    this.extension = key.toString().substring(key.toString().lastIndexOf('.') + 1);
    this.headers = headers;
    this.size = size;
    this.date = date;
    this.start = start;
    this.end = end;
  }
}
