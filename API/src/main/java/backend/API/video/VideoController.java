package backend.API.video;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.drew.imaging.mp4.Mp4MetadataReader;
import com.drew.metadata.MetadataException;
import com.drew.metadata.mp4.Mp4Directory;

@RestController
@RequestMapping("/api/videos")
public class VideoController {

    private static final String UPLOAD_DIR = "videos";

    @PostMapping("/upload")
    public ResponseEntity<String> uploadVideo(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please upload a file");
        }

        try {
            // Save the uploaded video file
            String fileName = file.getOriginalFilename();
            String filePath = UPLOAD_DIR + File.separator + fileName;
            file.transferTo(new File(filePath));

            return ResponseEntity.ok("Video uploaded successfully: " + fileName);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Failed to upload the file");
        }
    }

    @GetMapping("/metadata")
    public List<VideoInformation> getVideoMetadata() {
        // Retrieve metadata for all videos in the videos folder
        File[] videoFiles = new File(UPLOAD_DIR).listFiles();
        List<VideoInformation> videoInformationList = new ArrayList<>();

        if (videoFiles != null) {
            for (File videoFile : videoFiles) {
                VideoInformation videoInformation = extractMetadata(videoFile);
                videoInformationList.add(videoInformation);
            }
        }

        return videoInformationList;
    }

    @GetMapping("/metadata/{fileName}")
    public ResponseEntity<VideoInformation> getVideoMetadataByFileName(@PathVariable String fileName) {
        // Retrieve metadata for a specific video file
        File videoFile = new File(UPLOAD_DIR + File.separator + fileName);

        if (!videoFile.exists()) {
            return ResponseEntity.notFound().build();
        }

        VideoInformation videoInformation = extractMetadata(videoFile);
        return ResponseEntity.ok(videoInformation);
    }

    private VideoInformation extractMetadata(File file) {
        try {
            // Extract metadata from a video file using Mp4MetadataReader
            Mp4Directory metadata = Mp4MetadataReader.readMetadata(file).getFirstDirectoryOfType(Mp4Directory.class);

            // Create a VideoInformation object from the extracted metadata
            String title = file.getName();
            int duration = metadata.getInt(Mp4Directory.TAG_DURATION);
            Date creationTime = metadata.getDate(Mp4Directory.TAG_CREATION_TIME);
            Float frameRate = metadata.getFloat(Mp4Directory.TAG_PREFERRED_RATE);

            return new VideoInformation(title, duration, creationTime, frameRate);

        } catch (MetadataException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        
        return null;
    }
}
