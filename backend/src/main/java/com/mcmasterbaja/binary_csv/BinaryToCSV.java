package com.mcmasterbaja.binary_csv;

import java.nio.file.Paths;

public class BinaryToCSV {

  public static native void toCSV(String filename, String outputDir, boolean folder);

  public static native void bytesToCSV(
      byte[] bytes, String outputDir, String fileName, boolean folder);

  private static final String relativePath = "/src/main/java/com/mcmasterbaja/binary_csv/";

  static {
    String path = System.getProperty("user.dir");

    // Determine the appropriate library extension based on the OS
    String osName = System.getProperty("os.name").toLowerCase();
    if (osName.contains("mac")) {
      path += relativePath + "libbinary_to_csv_lib.dylib";
    } else if (osName.contains("linux")) {
      path += relativePath + "libbinary_to_csv_lib.so";
    } else { // Default to Windows
      path += relativePath + "binary_to_csv_lib.dll";
    }

    System.load(path);
  }

  public static void main(String[] args) {
    System.out.println(
        Paths.get("src/main/java/com/mcmasterbaja/binary_csv/040918.bin")
            .toAbsolutePath()
            .toString());
    System.out.println(Paths.get("uploads").toAbsolutePath() + "\\");
    try {
      toCSV(
          Paths.get("src/main/java/com/mcmasterbaja/binary_csv/040918.bin")
              .toAbsolutePath()
              .toString(),
          Paths.get("uploads").toAbsolutePath() + "\\",
          true);
    } catch (UnsatisfiedLinkError e) {
      // Print the error in full
      e.printStackTrace();
      System.out.println(e);
    }

    System.out.println("Done");
  }
}
