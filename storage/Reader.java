package storage;

public abstract class Reader {
    file F;

    //Constructor
    public Reader(file F) {
        this.F = F;
    }

    //Reader that can specify constraints of regular expressions
    public abstract String read(String regex);

    public abstract String readline();
    
}
