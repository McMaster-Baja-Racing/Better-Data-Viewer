package com.mcmasterbaja.analyzer;

import com.mcmasterbaja.exceptions.InvalidInputFileException;
import com.mcmasterbaja.exceptions.InvalidOutputFileException;
import com.mcmasterbaja.exceptions.InvalidColumnException;
import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import com.opencsv.CSVWriter;
import com.opencsv.CSVWriterBuilder;
import com.opencsv.ICSVWriter;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;

public abstract class Analyzer {

  protected String[] inputFiles;
  protected String[] inputColumns;
  protected String[] outputFiles;

  public Analyzer(String[] inputFiles, String[] inputColumns, String[] outputFiles) {
    this.inputFiles = inputFiles;
    this.inputColumns = inputColumns;
    this.outputFiles = outputFiles;
  }

  public Analyzer(String[] inputFiles, String[] outputFiles) {
    this.inputFiles = inputFiles;
    this.inputColumns = new String[1];
    this.outputFiles = outputFiles;
  }

  public abstract void analyze();

  public CSVReader getReader(String filePath) {
    try {
      FileReader fileReader = new FileReader(filePath);
      BufferedReader bufferedReader = new BufferedReader(fileReader);
      return new CSVReaderBuilder(bufferedReader)
          .withSkipLines(0)
          .build();
    } catch (IOException e) {
      throw new InvalidInputFileException("Failed to read input file: " + filePath, e);
    }
  }

  public ICSVWriter getWriter(String filePath) {
    try {
      FileWriter fileWriter = new FileWriter(filePath);
      BufferedWriter bufferedWriter = new BufferedWriter(fileWriter);
      return new CSVWriterBuilder(bufferedWriter)
          .withSeparator(CSVWriter.DEFAULT_SEPARATOR)
          .withQuoteChar(CSVWriter.NO_QUOTE_CHARACTER)
          .withEscapeChar(CSVWriter.DEFAULT_ESCAPE_CHARACTER)
          .withLineEnd(CSVWriter.DEFAULT_LINE_END)
          .build();
    } catch (IOException e) {
      throw new InvalidOutputFileException("Failed to write to output file: " + filePath, e);
    }
  }

  public int getAnalysisColumnIndex(int fileIndex, List<String> fileHeaders) {
    for (int i = 0; i < fileHeaders.size(); i++) {
      if (fileHeaders.get(i).trim().equals(this.inputColumns[fileIndex])) {
        return i;
      }
    }
    throw new InvalidColumnException("No column in file exists with analysis column name " + this.inputColumns[fileIndex]);
  }

  public int getColumnIndex(String columnName, String[] fileHeaders) {
    for (int i = 0; i < fileHeaders.length; i++) {
      if (fileHeaders[i].trim().equals(columnName)) {
        return i;
      }
    }
    throw new InvalidColumnException("No column in file exists with analysis column name " + columnName);
  }
}