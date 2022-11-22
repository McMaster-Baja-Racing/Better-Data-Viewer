package storage.csv;

import java.util.ArrayList;
import java.util.List;
import java.io.BufferedReader;
import java.io.FileReader;



public class CSVReader extends Reader {
    private String file; // Some type of file object

    public CSVReader(String file) {
        super(file);
    }

    public List<String> read() {

        List<String> records = new ArrayList<String>();

        try (BufferedReader br = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = br.readLine()) != null) {
                records.add(line);
            }
        } catch (Exception e) {
            System.out.println("Error: " + e);
        }
    
        return records;
    }

    public static void main(String[] args) {
        CSVReader reader = new CSVReader("../../data/F_GPS_LATITUDE.csv");
        List<String> records = reader.read();
        for (String record : records) {
            System.out.println(record);
        }
    }
}
