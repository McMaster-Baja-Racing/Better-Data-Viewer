package dataanalyzer;

import storage.Reader;
import storage.Writer;

public abstract class DataAnalyzer {
    private Reader reader;
    private Writer writer;

    public DataAnalyzer(Reader reader, Writer writer) {
        this.reader = reader;
        this.writer = writer;
    }

    public void analyze() {
        String line = reader.readline();
        while (line != null) {
            String[] data = line.split(",");
            String result = analyze(data);
            writer.write(result);
            line = reader.readline();
        }
        writer.flush();
    }

    public abstract String analyze(String[] data);
    
}
