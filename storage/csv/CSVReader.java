package storage.csv;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;

import storage.Reader;

public class CSVReader extends Reader {
    // Constructor
    public CSVReader(String filePath) {
        super(filePath);
    }

    public List<List<String>> read() {
        // Initialize list and file
        List<List<String>> records = new ArrayList<List<String>>();
        File file = new File(filePath);

        if (file.exists()) {
            try {
                BufferedReader reader = new BufferedReader(new FileReader(file));
                String line;
                while ((line = reader.readLine()) != null) {
                    records.add(Arrays.asList(line.split(",")));
                }
                reader.close();
                return records;
            } catch (Exception e) {
                System.err.format("Exception occurred trying to read '%s'.", file);
                e.printStackTrace();
                return null;
            }
        } else {
            System.err.format("'%s' does not exist.", file);
            return null;
        }
    }

    public static void main(String[] args) {
        System.out.println("Hello World!");

        String file = "data/F_GPS_LATITUDE.csv";

        CSVReader reader = new CSVReader(file);
        List<List<String>> records = reader.read();

        for (List<String> record : records) {
            System.out.println(record);
        }
    }
}
