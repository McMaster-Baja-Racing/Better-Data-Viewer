// Author: Kai Arseneau
// This code is a file storage service implemented in Java using the Spring framework. 
// The service implements the StorageService interface and uses the file system to store and retrieve files. 
// The root location of the files is specified in a StorageProperties class that is passed to the constructor. 
// The service provides methods to store, load, and delete files, as well as to read the headers of a file. 
// Exceptions are thrown in the case of errors, such as IOException or StorageException, specified in the StorageException class.

package backend.API.storage;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.DoubleSummaryStatistics;
import java.util.Locale;
import java.util.stream.Stream;

import org.apache.commons.io.input.ReversedLinesFileReader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;
import org.springframework.web.multipart.MultipartFile;

import com.drew.imaging.mp4.Mp4MetadataReader;
import com.drew.metadata.Tag;
import com.drew.metadata.mp4.Mp4Directory;

@Service
public class FileSystemStorageService implements StorageService {

	private final Path rootLocation;

	public Path getRootLocation() {
		return this.rootLocation;
	}

	@Autowired
	public FileSystemStorageService(StorageProperties properties) {
		this.rootLocation = Paths.get(properties.getLocation());
	}

	@Override
	public void store(MultipartFile file) {
		try {
			if (file.isEmpty()) {
				throw new StorageException("Failed to store empty file.");
			}
			Path destinationFile = this.rootLocation.resolve(Paths.get(getFileExtension(file.getOriginalFilename()), file.getOriginalFilename()))
					.normalize().toAbsolutePath();
			if (!destinationFile.startsWith(this.rootLocation.toAbsolutePath())) {
				// This is a security check
				throw new StorageException("Cannot store file outside current directory.");
			}
			try (InputStream inputStream = file.getInputStream()) {
				Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
			}
		} catch (IOException e) {
			throw new StorageException("Failed to store file.", e);
		}
	}

	@Override
	public Stream<Path> loadAll() {
		try {
			return Files.walk(this.rootLocation, 3) //optional depth parameter
			.filter(path -> !Files.isDirectory(path))
			.map(this.rootLocation::relativize);

		} catch (IOException e) {
			throw new StorageException("Failed to read stored files", e);
		}

	}

	@Override
	public Stream<Path> loadFolder(String foldername) {
		try {
			Path folder = this.rootLocation.resolve(foldername);
			return Files.walk(folder, 2) //optional depth parameter
			.filter(path -> !Files.isDirectory(path))
			.map(folder::relativize);

		} catch (IOException e) {
			throw new StorageException("Failed to read stored files", e);
		}

	}

	@Override
	public Path load(String filename) {
		return rootLocation.resolve(getFileExtension(filename) + "/" + filename);
	}

	@Override
	public Resource loadAsResource(String filename) {
		try {
			Path file = load(filename);
			Resource resource = new UrlResource(file.toUri());
			if (resource.exists() || resource.isReadable()) {
				return resource;
			} else {
				throw new StorageFileNotFoundException(
						"Could not read file: " + filename);

			}
		} catch (MalformedURLException e) {
			throw new StorageFileNotFoundException("Could not read file: " + filename, e);
		}
	}

	@Override
	public void deleteAll() {
		FileSystemUtils.deleteRecursively(rootLocation.toFile());
	}

	@Override
	public void init() {
		try {
			Files.createDirectories(rootLocation);
			// Create sub folders for csv and mp4 files
			Files.createDirectories(rootLocation.resolve("csv"));
			Files.createDirectories(rootLocation.resolve("mp4"));
		} catch (IOException e) {
			throw new StorageException("Could not initialize storage", e);
		}
	}

	@Override
	public String readHeaders(String filename) {
		// Basically read the first line of the file and return it
		try {
			Path file = load(filename);
			String headers;
			if (getFileExtension(filename).equals("mp4")) {
				headers = extractMetadata(file);
			} else {
				headers = Files.lines(file).findFirst().get();
			}
			return headers;
		} catch (IOException e) {
			e.printStackTrace();
			return null;
		}
	}

	@Override
	public void delete(String filename) {
		try {
			Path file = load(filename);
			Files.delete(file);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	@Override
	public void copyFile(String filename, String newFilename) {
		try {
			Path file = load(filename);
			Path newFile = load(newFilename);
			Files.copy(file, newFile, StandardCopyOption.REPLACE_EXISTING);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	@Override
	public String getMaxMin(String filename, String headerName) {
		// Find the maximum and minimum values in the file for a given column
		try {
			// First find the index of the column
			String[] headerArray = readHeaders(filename).split(",");
			int index = -1;

			for (int i = 0; i < headerArray.length; i++) {
				if (headerArray[i].equals(headerName)) {
					index = i;
					break;
				}
			}

			if (index == -1) {
				return null;
			}

			// Now find the max and min values

			Path file = load(filename);
			final int finalIndex = index;
			try (Stream<String> lines = Files.lines(file)) {
				DoubleSummaryStatistics stats = lines
					.skip(1)  // Skip the header line
					.map(line -> line.split(",")[finalIndex])
					.mapToDouble(Double::parseDouble)
					.summaryStatistics();

				double min = stats.getMin();
				double max = stats.getMax();

				return min + "," + max;
			}
			

		} catch (IOException e) {
			e.printStackTrace();
			return null;
		}
	}

	// Get timspan for mp4 file from metadata
	@Override
	public String getTimespan(String filename) {
		// Gets the metadata of the file to find the creation time and duration
		String metadata = extractMetadata(load(filename));
		
		// Converts the creation time to a ZonedDateTime with GMT timezone
		ZonedDateTime creationTime = ZonedDateTime.parse(getTagValue(metadata, "Creation Time"),
		DateTimeFormatter.ofPattern("EEE MMM dd HH:mm:ss zzz yyyy", Locale.ENGLISH))
		.withZoneSameInstant(ZoneId.of("GMT"));
		
		// Below calculation gives a better estimate than Duration in Seconds tag
		// Each is converted to nanoseconds and then divided to preserve precision
		long duration = (Long.parseLong(getTagValue(metadata, "Duration")) * 1_000_000_000) / (Long.parseLong(getTagValue(metadata, "Media Time Scale")) * 1_000_000_000);

        // Returns the start and end times as strings in GMT with milliseconds
        return creationTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS")) + "," + creationTime.plusSeconds(duration).format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS"));
	}
	
	// Get timspan for csv file from a parsed bin file
    @Override
	public String getTimespan(String filename, LocalDateTime zeroTime) {
		String timestamp1 = null;
		String timestamp2 = null;
		try {
			BufferedReader reader = new BufferedReader(Files.newBufferedReader(load(filename)));
			timestamp1 = reader.lines().skip(1).findFirst().orElseThrow().split(",")[0];
			reader.close();
			ReversedLinesFileReader reverseReader = new ReversedLinesFileReader(load(filename), StandardCharsets.UTF_8);
			timestamp2 = reverseReader.readLine().split(",")[0];
			reverseReader.close();
		} catch (IOException e) {
			e.printStackTrace();
			return null;
		}

		LocalDateTime startTime = zeroTime.plusNanos((long) Double.parseDouble(timestamp1) * 1_000_000);
		LocalDateTime endTime = zeroTime.plusNanos((long) Double.parseDouble(timestamp2) * 1_000_000);

		return startTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS"))+ "," + endTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS"));
	}

	// Returns the DateTime of the folder at 0 timestamp
    // Only works for converted bins from the DAQ Box
    public LocalDateTime getZeroTime(Path folder) {
        try {
			// Get the values of the first line from the gps files ingoring the header
            String[] smhArray = Files.lines(rootLocation.resolve("csv/" + folder.toString() + "/GPS SECOND MINUTE HOUR.csv")).skip(1).findFirst().orElseThrow().split(",");
            String[] dmyArray = Files.lines(rootLocation.resolve("csv/" + folder.toString() + "/GPS DAY MONTH YEAR.csv")).skip(1).findFirst().orElseThrow().split(",");

			// Convert the values to a LocalDateTime and subtract the timestamp
            long timestamp = Long.parseLong(smhArray[0]);
            LocalDateTime zeroTime = LocalDateTime.of(
                    2000 + Integer.parseInt(dmyArray[3]),
                    Integer.parseInt(dmyArray[2]),
                    Integer.parseInt(dmyArray[1]),
                    Integer.parseInt(smhArray[3]),
                    Integer.parseInt(smhArray[2]),
                    Integer.parseInt(smhArray[1])
            ).minusNanos(timestamp * 1_000_000);

            return zeroTime;
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

	// Returns the extension of the file for folder organization
	@Override
	public String getFileExtension(String filename) {
		if (filename == null) return ""; // No file
		int dotIndex = filename.lastIndexOf(".");
		if (dotIndex == -1) return ""; // No extension
		String extension = filename.substring(dotIndex + 1).toLowerCase();
		// Returns csv for bin and mp4 for mov for file conversion
		switch (extension) {
			case "bin":
				return "csv";
			case "mov":
				return "mp4";
			default:
				return extension;
		}
	}
	

	// Returns all of the metadata in the file as string with commas between each value
	// Each value will be in the format "key - value"
	private String extractMetadata(Path file) {
        try {
            // Gets all the  metadata from the file in the form of a directory
            Mp4Directory metadata = Mp4MetadataReader.readMetadata(file.toFile()).getFirstDirectoryOfType(Mp4Directory.class);

			//Extracts all the key value pairs
			String metadataString = "";
			for (Tag tag : metadata.getTags()) {
				metadataString += tag.toString() + ",";
			}
			return metadataString;

        } catch (IOException e) {
            e.printStackTrace();
        }
        
        return null;
    }

	// Gets the value of a tag from the metadata of a file
	private String getTagValue(String metadata, String tag) {
		// Finds the tag in the metadata
		String[] metadataArray = metadata.split(",");
		for (String tagString : metadataArray) {
			if (tagString.contains(tag)) {
				return tagString.split(" - ")[1];
			}
		}

		return null;
	}

	    

}
