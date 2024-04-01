package backend.API;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class FileUploadControllerTests {

  @Autowired private FileUploadController controller;

  @Test
  void contextLoads() {
    assertThat(controller).isNotNull();
  }
}
