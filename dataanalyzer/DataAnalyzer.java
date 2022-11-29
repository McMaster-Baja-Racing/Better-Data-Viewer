package dataanalyzer;

import storage.Reader;

import java.util.List;

public abstract class DataAnalyzer {
    private Reader reader;

    public DataAnalyzer(Reader reader) {
        this.reader = reader;
    }

    public abstract List<List<String>> analyze(List<List<String>>[] data);
    
}
