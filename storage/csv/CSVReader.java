package storage.csv;

import storage.Reader;

public class CSVReader extends Reader {
    private String buf;
    private int bufSize;
    private int bufPos;
    private String file; // Some type of file object

    public CSVReader(String file) {
        this.file = file;
        buf = "";
        bufSize = 0;
        bufPos = 0;
    }

    public String read(String regex) {
        String result = "";
        int i = 0;
        while (i < regex.length()) {
            if (bufPos >= bufSize) {
                buf = file.readline();
                bufSize = buf.length();
                bufPos = 0;
            }
            if (bufPos >= bufSize) {
                return result;
            }
            if (regex.charAt(i) == buf.charAt(bufPos)) {
                result += buf.charAt(bufPos);
                bufPos++;
                i++;
            } else {
                return result;
            }
        }
        return result;
    }
}
