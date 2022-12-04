package dataanalyzer;

import java.util.List;

public abstract class DataAnalyzer {
    protected List<List<String>>[] data;

    public DataAnalyzer(List<List<String>>[] data) {
        this.data = data;
    }

    public abstract List<List<String>> analyze();
    
}