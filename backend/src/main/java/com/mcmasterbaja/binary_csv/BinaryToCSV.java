package com.mcmasterbaja.binary_csv;

import java.nio.file.Paths;

public class BinaryToCSV {

  public static native void toCSV(String filename, String outputDir, boolean folder);

  public static native void bytesToCSV(
      byte[] bytes, String outputDir, String fileName, boolean folder);

  static {
    // Get library path from environment variable (set in Dockerfile for production)
    String libraryPath = System.getenv("NATIVE_LIBRARY_PATH");
    
    // Fall back to dev path if not set
    if (libraryPath == null || libraryPath.isEmpty()) {
      libraryPath = System.getProperty("user.dir") + "/src/main/java/com/mcmasterbaja/binary_csv";
    }

    // Determine the appropriate library name based on the OS
    String osName = System.getProperty("os.name").toLowerCase();
    String libraryName;
    if (osName.contains("mac")) {
      libraryName = "libbinary_to_csv_lib.dylib";
    } else if (osName.contains("linux")) {
      libraryName = "libbinary_to_csv_lib.so";
    } else { // Default to Windows
      libraryName = "binary_to_csv_lib.dll";
    }

    String fullPath = Paths.get(libraryPath, libraryName).toString();
    System.out.println("Loading native library from: " + fullPath);
    System.load(fullPath);
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
