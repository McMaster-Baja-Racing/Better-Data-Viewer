package com.mcmasterbaja.services;

import com.mcmasterbaja.exceptions.InvalidArgumentException;
import com.mcmasterbaja.model.SmartAnalyzerParams;
import com.mcmasterbaja.model.AnalyzerParams;
import com.mcmasterbaja.model.AnalyzerType;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Stream;

@ApplicationScoped
public class SmartAnalyzerService {
    
    @Inject
    Logger logger;
    
    @Inject
    StorageService storageService;
    
    private static final String TIMESTAMP_HEADER = "Timestamp (ms)";
    
    public AnalyzerParams convertToAnalyzerParams(SmartAnalyzerParams smartParams) {
        logger.info("Converting smart analyzer params: " + smartParams.toString());
        
        // Find files containing the requested data types from their respective sources
        String xFile = findFileContainingDataType(smartParams.getXDataType(), smartParams.getXSource());
        String yFile = findFileContainingDataType(smartParams.getYDataType(), smartParams.getYSource());
        
        logger.info("Found xFile: " + xFile + ", yFile: " + yFile);
        
        // Determine analyzer type based on file compatibility
        AnalyzerType analyzerType = determineAnalyzerType(smartParams.getXDataType(), xFile, yFile);
        
        // Handle special timestamp case - if X is timestamp and files are different, use Y file for both
        if (TIMESTAMP_HEADER.equals(smartParams.getXDataType()) && !xFile.equals(yFile)) {
            // Use Y file for both since every file has timestamps
            xFile = yFile;
            analyzerType = null; // No analyzer needed for same file
        }
        
        // Create traditional AnalyzerParams
        AnalyzerParams params = new AnalyzerParams();
        params.setInputFiles(new String[]{xFile, yFile});
        params.setInputColumns(new String[]{smartParams.getXDataType(), smartParams.getYDataType()});
        params.setType(analyzerType);
        params.setOptions(smartParams.getAnalyzerOptions().toArray(new String[0]));
        
        // Update input files with root location
        params.updateInputFiles(storageService.getRootLocation());
        params.generateOutputFileNames();
        
        return params;
    }
    
    private String findFileContainingDataType(String dataType, String sourcePath) {
        try {
            Path sourceFullPath = storageService.getRootLocation().resolve("csv").resolve(sourcePath);
            
            if (!Files.exists(sourceFullPath)) {
                throw new InvalidArgumentException("Source path does not exist: " + sourcePath);
            }
            
            // Check if it's a direct file request (dataType.csv)
            String directFileName = dataType + ".csv";
            Path directFile = sourceFullPath.resolve(directFileName);
            if (Files.exists(directFile)) {
                return sourcePath + "/" + directFileName;
            }
            
            // Search through all CSV files in the source path
            try (Stream<Path> files = Files.list(sourceFullPath)) {
                return files
                    .filter(path -> path.toString().endsWith(".csv"))
                    .filter(path -> fileContainsHeader(path, dataType))
                    .findFirst()
                    .map(path -> sourcePath + "/" + path.getFileName().toString())
                    .orElseThrow(() -> new InvalidArgumentException(
                        "No file found containing data type: " + dataType + " in source: " + sourcePath));
            }
        } catch (IOException e) {
            throw new InvalidArgumentException("Error searching for data type: " + dataType + " in source: " + sourcePath, e);
        }
    }
    
    private boolean fileContainsHeader(Path filePath, String header) {
        try {
            List<String> lines = Files.readAllLines(filePath);
            if (lines.isEmpty()) return false;
            
            String headerLine = lines.get(0);
            String[] headers = headerLine.split(",");
            
            for (String h : headers) {
                if (h.trim().equals(header)) {
                    return true;
                }
            }
            return false;
        } catch (IOException e) {
            logger.warn("Error reading file: " + filePath, e);
            return false;
        }
    }
    
    private AnalyzerType determineAnalyzerType(String xDataType, String xFile, String yFile) {
        // If same file, no analyzer needed
        if (xFile.equals(yFile)) {
            return null;
        }
        
        // If different files, need join analyzer
        // Default to INTERPOLATER_PRO for joining files
        return AnalyzerType.INTERPOLATER_PRO;
    }
}
