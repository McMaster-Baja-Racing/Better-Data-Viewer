package com.mcmasterbaja.model;

import jakarta.ws.rs.QueryParam;
import java.util.ArrayList;
import java.util.List;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class SmartAnalyzerParams {
    
    @QueryParam("xDataType")
    private String xDataType;
    
    @QueryParam("yDataType")
    private String yDataType;
    
    @QueryParam("folderPath")
    private String folderPath;
    
    @QueryParam("analyzerOptions")
    private List<String> analyzerOptions = new ArrayList<>();
    
    @QueryParam("live")
    private boolean live = false;

    public List<String> getErrors() {
        List<String> errors = new ArrayList<>();
        
        if (xDataType == null || xDataType.trim().isEmpty()) {
            errors.add("xDataType is required");
        }
        
        if (yDataType == null || yDataType.trim().isEmpty()) {
            errors.add("yDataType is required");
        }
        
        if (folderPath == null || folderPath.trim().isEmpty()) {
            errors.add("folderPath is required");
        }
        
        return errors;
    }
}
