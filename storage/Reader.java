package storage;

public abstract class Reader {
    File file;

    //Constructor
    public Reader(File file) {
        this.file = file;
    }

    //Reader that can specify constraints of regular expressions
    public abstract String read(String regex);

    public abstract String readline();
}

// TODO: Decide how we will store the data (SQL, CSV, etc)