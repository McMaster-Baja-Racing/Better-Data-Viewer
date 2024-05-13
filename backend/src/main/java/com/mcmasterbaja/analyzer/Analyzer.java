package com.mcmasterbaja.analyzer;

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
import java.util.List;

public abstract class Analyzer {

  // Input and output files are arrays because some analyzers may need multiple input files
  protected String[] inputFiles;
  protected String[] inputColumns;
  protected String[] outputFiles;

  public Analyzer(String[] inputFiles, String[] inputColumns, String[] outputFiles) {
    this.inputFiles = inputFiles;
    // inputColumns is the names of the columns we are analyzing. index 0 is the independent
    // variable (usually timestamp), 1+ are dependent variable(s)
    this.inputColumns = inputColumns;
    this.outputFiles = outputFiles;
  }

  // Some analyzers work on entire rows and don't need to select columns (e.g. compression), they
  // should use this constructor
  public Analyzer(String[] inputFiles, String[] outputFiles) {
    this.inputFiles = inputFiles;
    this.inputColumns = new String[1];
    this.outputFiles = outputFiles;
  }

  // Abstract method to be implemented by subclasses
  public abstract void analyze() throws IOException, CsvValidationException, CsvException;

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

  // From this list of headers, which one are we actually doing analysis on
  // fileIndex is basically the axis, 0=X, 1=Y, I made it a int to future-proof adding new columns
  public int getAnalysisColumnIndex(int fileIndex, List<String> fileHeaders)
      throws RuntimeException {
    for (int i = 0; i < fileHeaders.size(); i++) {
      if (fileHeaders.get(i).trim().equals(this.inputColumns[fileIndex])) {
        return i;
      }
    }
    // The inputColum is wrong somehow, should never happen with working frontend
    throw new RuntimeException("No column in file exists with analysis column name");
  }

  public int getColumnIndex(String columnName, String[] fileHeaders) throws RuntimeException {
    for (int i = 0; i < fileHeaders.length; i++) {
      if (fileHeaders[i].trim().equals(columnName)) {
        return i;
      }
    }
    throw new RuntimeException("No column in file exists with analysis column name");
  }
}
