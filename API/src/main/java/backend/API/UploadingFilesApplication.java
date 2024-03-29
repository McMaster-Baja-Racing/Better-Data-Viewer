package backend.API;

import backend.API.storage.StorageProperties;
import backend.API.storage.StorageService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;

/**
 * This is the main class for the UploadingFiles application. Its annotated
 * with @SpringBootApplication to indicate that it's a Spring Boot application. Its annotated
 * with @EnableConfigurationProperties to enable support for configuration properties.
 */
@SpringBootApplication
@EnableConfigurationProperties(StorageProperties.class)
public class UploadingFilesApplication {

  /**
   * The main method of the application. It starts the Spring Boot application.
   *
   * @param args command line arguments
   */
  public static void main(String[] args) {
    SpringApplication.run(UploadingFilesApplication.class, args);
  }

  /**
   * Annotated with @Bean to indicate that it should be managed by the Spring framework. It returns
   * a CommandLineRunner that deletes all files from the storage and then initializes it.
   *
   * @param storageService the storage service to use
   * @return a CommandLineRunner that deletes all files from the storage and then initializes it
   */
  @Bean
  CommandLineRunner init(StorageService storageService) {
    return (args) -> {
      storageService.deleteAll();
      storageService.init();
    };
  }
}
