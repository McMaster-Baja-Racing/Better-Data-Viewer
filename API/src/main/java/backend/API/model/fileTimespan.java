package backend.API.model;

import java.time.LocalDateTime;

public class fileTimespan {

    public String key;
    public LocalDateTime start;
    public LocalDateTime end;

    public fileTimespan(String key, LocalDateTime start, LocalDateTime end) {
        this.key = key;
        this.start = start;
        this.end = end;
    }

    public String toString() {
        return "File Name: " + key + "\nStart Date: " + start.toString() + "\nEnd Date: " + end.toString();
    }
    
}
