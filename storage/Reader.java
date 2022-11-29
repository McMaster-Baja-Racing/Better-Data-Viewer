package storage;

import java.io.File;
import java.util.List;

public abstract class Reader {
    protected String filePath;

    //Constructor
    public Reader(String filePath) {
        this.filePath = filePath;
    }

    //Reader which returns a List of every line in the file
    public abstract List<List<String>> read();
}

// TODO: Decide how we will store the data (SQL, CSV, etc)