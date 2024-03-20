package backend.API;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class FileUploadControllerTests {

	@Autowired
	private FileUploadController controller;

	@Test
	void contextLoads() {
		assertThat(controller).isNotNull();
	}
}