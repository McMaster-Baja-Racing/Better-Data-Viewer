package com.mcmasterbaja.binary_csv;

import java.nio.file.Paths;

public class BinaryToCSV {

  public static native void toCSV(String filename, String outputDir, boolean folder);
  public static native void bytesToCSV(byte[] bytes, String outputDir, String fileName, boolean folder);
  
  private static final String relativePath = "/src/main/java/backend/API/binary_csv/";

  static {
    String path = System.getProperty("user.dir");
    path += relativePath + "/binary_to_csv_lib.dll";
    System.out.println("PATH  " + path);
    System.load(path);
  }

  public static void main(String[] args) {
    System.out.println(Paths.get("upload-dir").toAbsolutePath() + "\\");
    toCSV(
        Paths.get(relativePath + "/151408.bin").toAbsolutePath().toString(),
        Paths.get("API/upload-dir").toAbsolutePath() + "\\",
        false);
    System.out.println("Done");
  }
}
