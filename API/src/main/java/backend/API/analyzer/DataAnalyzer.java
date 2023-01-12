package backend.API.analyzer;

public abstract class DataAnalyzer {
    protected String[] filepaths;

    public DataAnalyzer(String[] filepaths) {
        this.filepaths = filepaths;
    }

    public abstract String analyze();

}