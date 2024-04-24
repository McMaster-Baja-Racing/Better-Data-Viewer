package com.mcmasterbaja.services;

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
