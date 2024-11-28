package com.mcmasterbaja.readwrite;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;

public class CSVWriter extends Writer {

  public CSVWriter(String filepath) {
    super(filepath);
  }

  @Override
  public void write(List<List<String>> data) {
    try {
      BufferedWriter writer = new BufferedWriter(new FileWriter(filepath));
      for (List<String> row : data) {
        String line = String.join(",", row);
        writer.write(line);
        writer.newLine();
      }
      writer.close();
    } catch (IOException e) {
      System.err.format("Exception occurred trying to write '%s'.", filepath);
      e.printStackTrace();
    }
  }

  // For testing purposes only
  public static void main(String[] args) {
    String file = "data/F_GPS_LATITUDE.csv";

    CSVReader reader = new CSVReader(file);
    List<List<String>> records = reader.read();

    for (List<String> record : records) {
      System.out.println(record);
    }

    CSVWriter writer = new CSVWriter("data/test.csv");
    writer.write(records);
  }
}
