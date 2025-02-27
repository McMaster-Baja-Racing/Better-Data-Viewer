package com.mcmasterbaja.analyzer;

import com.mcmasterbaja.annotations.OnAnalyzerException;
import com.mcmasterbaja.exceptions.InvalidColumnException;
import com.mcmasterbaja.exceptions.InvalidInputFileException;
import com.mcmasterbaja.exceptions.InvalidOutputFileException;
import com.mcmasterbaja.model.AnalyzerParams;
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
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

@OnAnalyzerException
public abstract class Analyzer {
  protected String[] inputFiles;
  protected String[] inputColumns;
  protected String[] outputFiles;

  // Abstract method to be implemented by subclasses
  public abstract void analyze(AnalyzerParams params);

  public void extractParams(AnalyzerParams params) {
    this.inputFiles = params.getInputFiles();
    this.inputColumns = params.getInputColumns();
    this.outputFiles = params.getOutputFiles();
  }

  public void getReader(String filePath, Consumer<CSVReader> action) {
    try (FileReader fileReader = new FileReader(filePath);
        BufferedReader bufferedReader = new BufferedReader(fileReader);
        CSVReader reader = new CSVReaderBuilder(bufferedReader).withSkipLines(0).build()) {
      action.accept(reader);
    } catch (IOException e) {
      throw new InvalidInputFileException("Failed to read input file: " + filePath, e);
    }
  }

  public void getReaders(String[] filePaths, Consumer<Map<String, CSVReader>> action) {
    Map<String, CSVReader> readersMap =
        new LinkedHashMap<>(); // LinkedHashMap to preserve insertion order

    try {
      for (String filePath : filePaths) {
        FileReader fileReader = new FileReader(filePath);
        BufferedReader bufferedReader = new BufferedReader(fileReader);
        CSVReader reader = new CSVReaderBuilder(bufferedReader).withSkipLines(0).build();
        readersMap.put(filePath, reader);
      }
      action.accept(readersMap);

    } catch (IOException e) {
      throw new InvalidInputFileException("Failed to read input files", e);

      // Finally block always executes, so readers will always close even if an
      // exception occurred in the try block.
    } finally {
      List<Exception> exceptions = new ArrayList<>();

      for (Map.Entry<String, CSVReader> entry : readersMap.entrySet()) {
        String filePath = entry.getKey();
        CSVReader reader = entry.getValue();
        if (reader != null) {
          try {
            reader.close();
          } catch (IOException e) {
            exceptions.add(
                new InvalidInputFileException(
                    "Failed to close CSV reader for file: " + filePath, e));
          }
        }
      }

      // If any exceptions occurred while closing readers, combine them and throw as a
      // single exception
      if (!exceptions.isEmpty()) {
        InvalidInputFileException combo =
            new InvalidInputFileException("Multiple exceptions occurred.");
        for (Exception e : exceptions) {
          combo.addSuppressed(e);
        }

        throw combo;
      }
    }
  }

  /**
   * Default behaviour is to use the 0th output file, will need to be overridden in some special
   * cases
   *
   * @return Filename of the analyzer output
   */
  public String getOutputFilename() {
    return this.outputFiles[0];
  }

  public void getWriter(String filePath, Consumer<ICSVWriter> action) {
    try (FileWriter fileWriter = new FileWriter(filePath);
        BufferedWriter bufferedWriter = new BufferedWriter(fileWriter);
        ICSVWriter writer =
            new CSVWriterBuilder(bufferedWriter)
                .withSeparator(CSVWriter.DEFAULT_SEPARATOR)
                .withQuoteChar(CSVWriter.NO_QUOTE_CHARACTER)
                .withEscapeChar(CSVWriter.DEFAULT_ESCAPE_CHARACTER)
                .withLineEnd(CSVWriter.DEFAULT_LINE_END)
                .build()) {
      action.accept(writer);
    } catch (IOException e) {
      throw new InvalidOutputFileException("Failed to write to output file: " + filePath, e);
    } catch (Exception e) {
      try {
        Files.deleteIfExists(Paths.get(filePath));
      } catch (IOException delException) {
        e.addSuppressed(delException);
      }
      throw e;
    }
  }

  public int getColumnIndex(String columnName, String[] fileHeaders) {
    for (int i = 0; i < fileHeaders.length; i++) {
      if (fileHeaders[i].trim().equals(columnName)) {
        return i;
      }
    }
    throw new InvalidColumnException(
        "No column in file exists with analysis column name " + columnName);
  }
}
