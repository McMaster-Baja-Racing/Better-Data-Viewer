package com.mcmasterbaja.services;

import jakarta.ws.rs.core.StreamingOutput;
import java.io.InputStream;
import java.nio.file.Path;
import java.util.stream.Stream;

public interface StorageService {

  /** Initializes the storage service, setting up required directories. */
  void init();

  /**
   * Returns the root location where the files are stored.
   *
   * @return The root Path.
   */
  Path getRootLocation();

  /**
   * Stores a file.
   *
   * @param fileData The InputStream of the file data to be stored.
   * @param targetPath The Path under which the file is to be stored.
   */
  void store(InputStream fileData, Path targetPath);

  /**
   * Loads a file as a Path.
   *
   * @param targetPath The Path of the file to load.
   * @return The Path to the file, which can be used to read or process the file.
   */
  Path load(Path targetPath);

  /**
   * Lists all files stored in the root location.
   *
   * @return A Stream of Paths representing the files.
   */
  Stream<Path> loadAll();

  /**
   * Loads all files in a directory.
   *
   * @param dir The directory to load files from.
   * @return A Stream of Paths representing the files
   */
  Stream<Path> loadAll(Path dir);

  /**
   * Loads all directories in the root location.
   *
   * @param dir The directory to load directories from.
   * @return A Stream of Paths representing the directories.
   */
  Stream<Path> loadDirectories(Path dir);

  /**
   * Creates a temporary directory for request-scoped file processing, executes the action, and
   * automatically cleans up the directory afterwards.
   *
   * @param requestId The unique identifier for the request.
   * @param action The action to execute with the temporary directory.
   */
  void withTempDirectory(String requestId, java.util.function.Consumer<Path> action);

  /**
   * Creates a temporary directory, executes function to get a StreamingOutput, wraps it with
   * cleanup logic that runs after streaming completes.
   *
   * @param requestId The unique identifier for the request.
   * @param function Function that takes temp directory and returns StreamingOutput.
   * @return StreamingOutput that includes cleanup after streaming.
   */
  StreamingOutput withTempDirectoryForStreaming(
      String requestId, java.util.function.Function<Path, StreamingOutput> function);

  /**
   * Deletes a file.
   *
   * @param targetPath The Path of the file to delete.
   */
  void delete(Path targetPath);

  /**
   * Deletes all files stored in a directory.
   *
   * @param targetPath The Path of the file to delete.
   */
  void deleteAll(Path dir);

  /** Deletes all files in the root location. */
  void deleteAll();
}
