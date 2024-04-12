package com.mcmasterbaja.storage;

import java.nio.file.Path;

public interface FileMetadataService {

  /**
   * Reads the headers of a csv file.
   * @param targetPath The Path of the file to read.
   * @return A String[] of the headers.
   */
  String[] readHeaders(Path targetPath);

  /**
   * Gets the minimum and maximum values of a column in a csv file.
   * @param targetPath The Path of the file to read.
   * @param column The column to analyze.
   * @return A double[] containing the minimum and maximum values.
   */
  Double[] getMinMax(Path targetPath, String column);
  
}
