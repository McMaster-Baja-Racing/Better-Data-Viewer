package backend.API.binary_csv;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.io.IOException;

import java.nio.file.Paths;
import java.nio.file.Path;

public class BinaryToCSV {
    
    public static native void toCSV(String filename, String outputDir, boolean folder);

    private static String relativePath = "/src/main/java/backend/API/binary_csv/";

    static {
        String path = System.getProperty("user.dir");
        path += relativePath + "/binary_to_csv_lib.dll";
        System.out.println("PATH  " + path.toString());
        System.load(path.toString());
    }

    public static void main(String[] args) {
        System.out.println(Paths.get("upload-dir").toAbsolutePath().toString() + "\\");
        toCSV(Paths.get(relativePath + "/151408.bin").toAbsolutePath().toString(), Paths.get("API/upload-dir").toAbsolutePath().toString() + "\\", false);
        System.out.println("Done");
    }
}