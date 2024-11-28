package backend.API.readwrite;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class CSVReader extends Reader {

  public CSVReader(String filepath) {
    super(filepath);
  }

  @Override
  public List<List<String>> read() {
    // Initialize list and file
    List<List<String>> records = new ArrayList<List<String>>();
    File file = new File(filepath);

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
        System.err.format("Exception occurred trying to read '%s'.\n", file);
        e.printStackTrace();
        return null;
      }
    } else {
      System.err.format("'%s' does not exist.\n", file);
      return null;
    }
  }

  public Integer getSize() {
    // Check if file exists
    File file = new File(filepath);
    if (!file.exists()) {
      System.err.format("'%s' does not exist.\n", file);
      return -1;
    }
    // make this efficient
    List<List<String>> records = read();
    return records.size();
  }

  // For testing purposes only
  public static void main(String[] args) {
    String file = "data/F_GPS_LATITUDE.csv";

    CSVReader reader = new CSVReader(file);
    List<List<String>> records = reader.read();

    for (List<String> record : records) {
      System.out.println(record);
    }
  }
}
