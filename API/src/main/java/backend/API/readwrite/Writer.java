package backend.API.readwrite;

import java.util.List;

public abstract class Writer {
  protected String filepath;

  public Writer(String filepath) {
    this.filepath = filepath;
  }

  public abstract void write(List<List<String>> data);

  public String getFilepath() {
    return filepath;
  }

  public void setFilepath(String filepath) {
    this.filepath = filepath;
  }
}
