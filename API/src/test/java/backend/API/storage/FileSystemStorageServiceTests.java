package backend.API.storage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Random;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledOnOs;
import org.junit.jupiter.api.condition.OS;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;

public class FileSystemStorageServiceTests {

  private StorageProperties properties = new StorageProperties();
  private FileSystemStorageService service;

  @BeforeEach
  public void init() {
    properties.setLocation("target/files/" + Math.abs(new Random().nextLong()));
    service = new FileSystemStorageService(properties);
    service.init();
  }

  @Test
  public void emptyUploadLocation() {
    service = null;
    properties.setLocation("");
    assertThrows(
        StorageException.class,
        () -> {
          service = new FileSystemStorageService(properties);
        });
  }

  @Test
  public void loadNonExistent() {
    assertThat(service.load("foo.txt")).doesNotExist();
  }

  // @Test
  // public void saveAndLoad() {
  //   service.store(
  //       new MockMultipartFile(
  //           "foo", "foo.txt", MediaType.TEXT_PLAIN_VALUE, "Hello, World".getBytes()));
  //   assertThat(service.load("foo.txt")).exists();
  // }

  // @Test
  // public void saveRelativePathNotPermitted() {
  //   assertThrows(
  //       StorageException.class,
  //       () -> {
  //         service.store(
  //             new MockMultipartFile(
  //                 "foo", "../foo.txt", MediaType.TEXT_PLAIN_VALUE, "Hello, World".getBytes()));
  //       });
  // }

  @Test
  public void saveAbsolutePathNotPermitted() {
    assertThrows(
        StorageException.class,
        () -> {
          service.store(
              new MockMultipartFile(
                  "foo", "/etc/passwd", MediaType.TEXT_PLAIN_VALUE, "Hello, World".getBytes()));
        });
  }

  @Test
  @EnabledOnOs({OS.LINUX})
  public void saveAbsolutePathInFilenamePermitted() {
    // Unix file systems (e.g. ext4) allows backslash '\' in file names.
    String fileName = "\\etc\\passwd";
    service.store(
        new MockMultipartFile(
            fileName, fileName, MediaType.TEXT_PLAIN_VALUE, "Hello, World".getBytes()));
    assertTrue(Files.exists(Paths.get(properties.getLocation()).resolve(Paths.get(fileName))));
  }

  // @Test
  // public void savePermitted() {
  //   service.store(
  //       new MockMultipartFile(
  //           "foo", "bar/../foo.txt", MediaType.TEXT_PLAIN_VALUE, "Hello, World".getBytes()));
  // }
}
