package com.mcmasterbaja.storage;

import java.io.InputStream;
import java.nio.file.Path;
import java.util.stream.Stream;

import com.mcmasterbaja.storage.exceptions.StorageException;

public interface StorageService {

  /** Initializes the storage service, setting up required directories. */
  void init() throws StorageException;

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
  void store(InputStream fileData, Path targetPath) throws StorageException;

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
  Stream<Path> loadAll() throws StorageException;

  /**
   * Loads all files in a directory.
   *
   * @param dir The directory to load files from.
   * @return A Stream of Paths representing the files
   */
  Stream<Path> loadAll(Path dir) throws StorageException;

  /**
   * Deletes a file.
   *
   * @param targetPath The Path of the file to delete.
   */
  void delete(Path targetPath) throws StorageException;

  /**
   * Deletes all files stored in a directory.
   * 
   * @param targetPath The Path of the file to delete.
   */
  void deleteAll(Path dir) throws StorageException;

  /**
   * Deletes all files in the root location.
   * 
   */
  void deleteAll() throws StorageException;
}
