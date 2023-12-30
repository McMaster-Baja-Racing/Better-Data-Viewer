package backend.API.video;
import java.util.Date;

public class VideoInformation {
    private String title;
    private int duration; // in milliseconds
    private Date creationTime;
    private float frameRate;

    // Constructor
    public VideoInformation(String title, int duration, Date creationTime, float frameRate) {
        this.title = title;
        this.duration = duration;
        this.creationTime = creationTime;
        this.frameRate = frameRate;
    }

    // Getters
    public String getTitle() {
        return title;
    }

    public int getDuration() {
        return duration;
    }

    public Date getcreationTime() {
        return creationTime;
    }

    public float getFrameRate() {
        return frameRate;
    }

    // Setters
    public void setTitle(String title) {
        this.title = title;
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }

    public void setcreationTime(Date creationTime) {
        this.creationTime = creationTime;
    }

    public void setFrameRate(float frameRate) {
        this.frameRate = frameRate;
    }
}
