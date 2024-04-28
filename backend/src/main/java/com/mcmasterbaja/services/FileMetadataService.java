package com.mcmasterbaja.services;

import java.nio.file.Path;
import java.time.LocalDateTime;

public interface FileMetadataService {

  /**
   * Reads the headers of a csv file.
   *
   * @param targetPath The Path of the file to read.
   * @return A String[] of the headers.
   */
  String[] readHeaders(Path targetPath);

  /**
   * Gets the size of the file.
   *
   * @param targetPath The path of the file to read.
   * @return the size of the file
   */
  long getSize(Path targetPath);

  /**
   * Gets the minimum and maximum values of a column in a csv file.
   *
   * @param targetPath The Path of the file to read.
   * @param column The column to analyze.
   * @return A double[] containing the minimum and maximum values.
   */
  Double[] getMinMax(Path targetPath, String column);

  /**
   * Gets the last value of the column in the file.
   *
   * @param targetPath The Path of the file to read.
   * @return The last value of the column
   */
  String getLast(Path targetPath, int columnIndex);

  /**
   * Checks if the timespan of a folder can be computed.
   *
   * @param folderPath The Path of the folder to analyze.
   * @return A boolean indicating if the timespan can be computed.
   */
  boolean canComputeTimespan(Path folderPath);

  /**
   * Gets the start and end times of a file in GMT
   *
   * @param targetPath The Path of the file to analyze.
   * @param zeroTime The datetime when timestamp is zero milliseconds
   * @return A LocalDateTime[] containing the start and end times of the file.
   */
  LocalDateTime[] getTimespan(Path targetPath, LocalDateTime zeroTime);

  /**
   * Gets the datetime in GMT when then timestamp is zero milliseconds.
   *
   * @param folderPath The Path of the folder to analyze.
   * @return The datetime of the folder when timestamp (ms) is zero.
   */
  LocalDateTime getZeroTime(Path folderPath);

  /**
   * Gets the desired folder for a file.
   *
   * @param pathString The Path of the file to analyze.
   * @return The desired type folder.
   */
  String getTypeFolder(String pathString);
}
