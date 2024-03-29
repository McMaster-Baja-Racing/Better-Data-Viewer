package backend.API.model;

// This class represents the data structure that is used to send information about the file through
// to the front end
// In order to send information, there must be either public getters or public variables
public class fileInformation {

  public String key;
  public String[] fileHeaders;
  public long size;

  public fileInformation(String key, String[] fileHeaders, long size) {
    this.key = key;
    this.fileHeaders = fileHeaders;
    this.size = size;
  }

  public String toString() {
    String headers = "";
    for (int i = 0; i < fileHeaders.length; i++) {
      headers += fileHeaders[i] + ", ";
    }
    return "File Name: " + key + "\nFile Headers: " + headers + "\nFile Size: " + size;
  }
}
