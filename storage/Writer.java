package storage;

public abstract class Writer {
    private String buf;
    private int bufSize;
    private File file;

    public Writer(File file) {
        this.file = file;
        buf = "";
        bufSize = 0;
    }

    public void store(String s) {
        buf += s;
        bufSize += s.length();

        if (bufSize > 1000) {
            flush();
        }
    }

    public void flush() {
        if (bufSize > 0) {
            write(buf);
            buf = "";
            bufSize = 0;
        }
    }

    public abstract void write(String s);
}
