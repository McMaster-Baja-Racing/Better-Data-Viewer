package com.mcmasterbaja.readwrite;

import java.util.List;

public abstract class Reader {
  protected String filepath;

  public Reader(String filepath) {
    this.filepath = filepath;
  }

  public abstract List<List<String>> read();

  public abstract Integer getSize();

  public String getFilepath() {
    return filepath;
  }

  public void setFilepath(String filepath) {
    this.filepath = filepath;
  }
}


