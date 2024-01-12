package backend.API.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.stream.Stream;

public interface StorageService {

	void init();

	Path getRootLocation();

	void store(MultipartFile file);

	Stream<Path> loadAll();

	Stream<Path> loadFolder(String foldername);

	Path load(String filename);

	Resource loadAsResource(String filename);

	void deleteAll();

	void delete(String filename);

	void copyFile(String filename, String newFilename);

	String readHeaders(String filename);

	String getMaxMin(String filename, String headerName);

	String getFileExtension(String filename);

}