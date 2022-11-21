package storage.csv;

import storage.Writer;

public class CSVWriter extends Writer {
    private String buf;
    private int bufSize;
    private String file;

    public CSVWriter(String file) {
        this.file = file;
        buf = "";
        bufSize = 0;
    }

    public void write(String s) {
        buf += s;
        bufSize += s.length();

        if (bufSize > 1000) {
            flush();
        }
    }

    public void flush() {
        if (bufSize > 0) {
            file.send(buf);
            buf = "";
            bufSize = 0;
        }
    }
}
