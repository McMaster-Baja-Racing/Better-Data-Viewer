package com.mcmasterbaja.model;

import java.nio.file.Path;
import java.time.LocalDateTime;
import lombok.ToString;

@ToString
public class FileTimespan {

  public String key;
  public LocalDateTime start;
  public LocalDateTime end;

  public FileTimespan(String key, LocalDateTime start, LocalDateTime end) {
    this.key = key;
    this.start = start;
    this.end = end;
  }

  public FileTimespan(Path key, LocalDateTime start, LocalDateTime end) {
    this.key = key.toString().replace("\\", "/");
    this.start = start;
    this.end = end;
  }
}
