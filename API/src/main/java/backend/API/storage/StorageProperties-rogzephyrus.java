package backend.API.storage;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("storage")
public class StorageProperties {

  /**
   * Folder location for storing files Now you would think changing this would change the location,
   * but I couldn't figure out how to use this class in other places, so its hard coded in a lot of
   * other places... sorry!
   */
  private String location = "upload-dir";

  public String getLocation() {
    return location;
  }

  public void setLocation(String location) {
    this.location = location;
  }
}
