package com.mcmasterbaja.analyzer;

import com.mcmasterbaja.model.AnalyzerParams;
import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import com.opencsv.CSVWriter;
import com.opencsv.CSVWriterBuilder;
import com.opencsv.ICSVWriter;
import com.opencsv.exceptions.CsvException;
import com.opencsv.exceptions.CsvValidationException;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;

public abstract class Analyzer {
  protected String[] inputFiles;
  protected String[] inputColumns;
  protected String[] outputFiles;

  // Abstract method to be implemented by subclasses
  public abstract void analyze(AnalyzerParams params)
      throws IOException, CsvValidationException, CsvException;

  public void extractParams(AnalyzerParams params) {
    this.inputFiles = params.getInputFiles();
    this.inputColumns = params.getInputColumns();
    this.outputFiles = params.getOutputFiles();
  }

  // I/O methods
  // Streams as they avoid loading the entire file into memory at once
  public CSVReader getReader(String filePath) throws IOException {
    FileReader fileReader = new FileReader(filePath);
    BufferedReader bufferedReader = new BufferedReader(fileReader);
    return new CSVReaderBuilder(bufferedReader)
        .withSkipLines(0) // Skip header if needed
        .build();
  }

  public ICSVWriter getWriter(String filePath) throws IOException {
    FileWriter fileWriter = new FileWriter(filePath);
    BufferedWriter bufferedWriter = new BufferedWriter(fileWriter);
    return new CSVWriterBuilder(bufferedWriter)
        .withSeparator(CSVWriter.DEFAULT_SEPARATOR)
        .withQuoteChar(CSVWriter.NO_QUOTE_CHARACTER)
        .withEscapeChar(CSVWriter.DEFAULT_ESCAPE_CHARACTER)
        .withLineEnd(CSVWriter.DEFAULT_LINE_END)
        .build();
  }

  public int getColumnIndex(String columnName, String[] fileHeaders) throws RuntimeException {
    for (int i = 0; i < fileHeaders.length; i++) {
      if (fileHeaders[i].trim().equals(columnName)) {
        return i;
      }
    }
    throw new RuntimeException("No column in file exists with analysis column name " + columnName);
  }
}
