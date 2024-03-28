package backend.API.storage;

import java.nio.file.Path;
import java.util.stream.Stream;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

  void init();

  void store(MultipartFile file);

  Stream<Path> loadAll();

  Path load(String filename);

  Resource loadAsResource(String filename);

  void deleteAll();

  void delete(String filename);

  void copyFile(String filename, String newFilename);

  String readHeaders(String filename);

  String getMaxMin(String filename, String headerName);
}
