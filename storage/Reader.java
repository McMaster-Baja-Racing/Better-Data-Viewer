package storage;

import java.util.List;

public abstract class Reader {
    private String file;

    //Constructor
    public Reader(String file) {
        this.file = file;
    }

    //Reader that can specify constraints of regular expressions
    public abstract List<String> read();

    //public abstract String readline();
    public static void main(String[] args) {
        System.out.println("Hello World!");
    }
}

// TODO: Decide how we will store the data (SQL, CSV, etc)