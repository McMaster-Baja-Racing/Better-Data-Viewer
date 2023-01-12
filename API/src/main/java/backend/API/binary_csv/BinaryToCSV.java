package backend.API.binary_csv;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.io.IOException;

class BinaryTOCSV {
    private static native void toCSV(String filename, String outputDir, boolean folder);

    static {
        String path = System.getProperty("user.dir");
        path += "\\binary_to_csv_lib.dll";
        System.out.println("PATH  " + path);
        System.load(path);
    }

    public static void main(String[] args) {
        
        String currentpath = System.getProperty("user.dir");
        System.out.println("current path is: " + currentpath);
        toCSV(currentpath+"\\151408.bin", currentpath + "\\..\\..\\..\\..\\..\\..\\upload-dir\\", false);
        System.out.println("Done");
    }
}