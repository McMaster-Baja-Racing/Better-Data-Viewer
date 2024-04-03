package backend.API;

/*
 * This is the main controller for the entire backend. It handles all of the requests that come in from the front end
 * and then sends the appropriate response back. This is the only class that the front end should be interacting with.
 * There are quite a few moving parts, but each request should have
 * 		1. A unique mapping to the URL that the request is coming in on. This may include a variale such as {filename}
 * 		2. A method signature that includes the appropriate parameters (important ones are return type and input variables) for the request.
 * 			- The return type should generally be a ResponseEntity, which may contain any object that can be converted to JSON
 * 			- The input variables may be Path variables (such as ex/{filename}), Request Parameters (such as ?filename=), or Request Body (such as the file itself)
 * 		3. A method body that handles the request and returns the appropriate response.
 * 			- This may include calling other methods, but it should be self contained.
 * That's all I got for explanation, the internet and specifically the spring boot guides through their website daeldung.com are your friend.
*/

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.HandlerMapping;
import org.springframework.web.servlet.mvc.method.annotation.MvcUriComponentsBuilder;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import jakarta.servlet.http.HttpServletRequest;

import backend.API.storage.StorageFileNotFoundException;
import backend.API.storage.StorageService;
import backend.API.binary_csv.BinaryTOCSV;
import backend.API.live.Serial;

import backend.API.analyzer.Analyzer;

import backend.API.model.fileInformation;
import backend.API.model.fileTimespan;

@Controller
public class FileUploadController {

	private final StorageService storageService;

	@Autowired
	public FileUploadController(StorageService storageService) {
		this.storageService = storageService;
	}

	// This is the method that shows the upload form page, used for debugging
	@GetMapping("/")
	public String listUploadedFiles(Model model) throws IOException {

		model.addAttribute("files", storageService.loadAll().map(
				path -> MvcUriComponentsBuilder.fromMethodName(FileUploadController.class,
						"serveFile", path.getFileName().toString()).build().toUri().toString())
				.collect(Collectors.toList()));

		return "uploadForm";
	}

	//This is the default method that returns a single file
	@GetMapping("/files/**")
	@ResponseBody
	public ResponseEntity<Resource> serveFile(HttpServletRequest request) {
		// Catch the exception if the file is not found
		String path = (String) request.getAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE);
		path = path.substring("/files/".length());
		path = URLDecoder.decode(path, StandardCharsets.UTF_8);

		System.out.println("Serving file " + path);

		Resource file = storageService.loadAsResource(path);

		HttpHeaders responseHeaders = new HttpHeaders();

		responseHeaders.add(HttpHeaders.CONTENT_DISPOSITION,
		"attachment; filename=\"" + file.getFilename() + "\"");
		//Set these headers so that you can access from LocalHost
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

		return ResponseEntity.ok().headers(responseHeaders).body(file);
	}

	// This is the method that returns information about all the files, to be used
	// by fetch
	// It returns an object of type fileInformation from the model folder
	@GetMapping("/files")
	@ResponseBody
	public ResponseEntity<ArrayList<fileInformation>> listUploadedFiles() throws IOException {

		// Set these headers so that you can access from LocalHost
		HttpHeaders responseHeaders = new HttpHeaders();
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

		ArrayList<fileInformation> files = new ArrayList<fileInformation>();

		// Get name, headers and size of each file
		storageService.loadAll().forEach(path -> {
			try {
				// Get the path and filename of each file and print it
				long size = storageService.loadAsResource(path.toString()).contentLength();
				String[] headers = storageService.readHeaders(path.toString()).split(",");
				files.add(new fileInformation(path.toString().replace("\\", "/"), headers, size));
			} catch (IOException e) {
				e.printStackTrace();
			}
		});

		return ResponseEntity.ok().headers(responseHeaders).body(files);
	}

	// Returns the file information for all the files in a folder
	@GetMapping("/files/folder/{foldername:.+}")
	@ResponseBody
	public ResponseEntity<ArrayList<fileInformation>> listFolderFiles(@PathVariable String foldername) throws IOException {

		// Set these headers so that you can access from LocalHost
		HttpHeaders responseHeaders = new HttpHeaders();
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

		ArrayList<fileInformation> files = new ArrayList<fileInformation>();

		// Get name, headers and size of each file
		storageService.loadFolder(foldername).forEach(path -> {
			try {
				// Get the path and filename of each file and print it
				long size = storageService.loadAsResource(path.toString()).contentLength();
				String[] headers = storageService.readHeaders(path.toString()).split(",");
				files.add(new fileInformation(path.toString().replace("\\", "/"), headers, size));
			} catch (IOException e) {
				e.printStackTrace();
			}
		});

		return ResponseEntity.ok().headers(responseHeaders).body(files);
	}

	//This method returns information about a specific file, given the filename.
	//It should return the first row of the file (the header row) + [datetime, and the number of rows eventually]
	// Can be deleted?
	@GetMapping("/files/{filename:.+}/info")
	@ResponseBody
	public ResponseEntity<String> listFileInformation(@PathVariable String filename) throws IOException {

		// Set these headers so that you can access from LocalHost
		HttpHeaders responseHeaders = new HttpHeaders();
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

		// Get size, headers, datetime, etc.
		String fileinfo = storageService.readHeaders(filename);

		return ResponseEntity.ok().headers(responseHeaders).body(fileinfo);
	}

	// Returns the timespan of all the files in a type folder
	@GetMapping("/timespan/folder/{foldername:.+}")
	@ResponseBody
	public ResponseEntity<ArrayList<fileTimespan>> listFolderTimespans(@PathVariable String foldername) throws IOException {

		// Set these headers so that you can access from LocalHost
		HttpHeaders responseHeaders = new HttpHeaders();
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

		ArrayList<fileTimespan> timespans = new ArrayList<fileTimespan>();

		Stream<Path> paths = storageService.loadFolder(foldername);

		switch (foldername) {
			case "csv":
				// Holds the parent folder and the zero time
				Object[] container = {null, null};
				paths.forEach(path -> {
					if (path.getParent() != null) {
						// Updates the parent folder and zero time if the parent folder changes to avoid recalculating the zero time
						if (container[0] != path.getParent()) {
							container[0] = path.getParent();
							container[1] = storageService.getZeroTime((Path) container[0]);
						}
						// Get the path and filename of each file and print it
						LocalDateTime[] timespan = storageService.getTimespan(path.toString(), (LocalDateTime) container[1]);
						timespans.add(new fileTimespan(path.toString().replace("\\", "/"), timespan[0], timespan[1]));
					}
				});
				break;
			case "mp4":
				paths.forEach(path -> {
					// Get the path and filename of each file and print it
					LocalDateTime[] timespan = storageService.getTimespan(path.toString());
					timespans.add(new fileTimespan(path.toString().replace("\\", "/"), timespan[0], timespan[1]));
				});
				break;
			default: throw new IllegalArgumentException("Invalid folder name");
		}

		return ResponseEntity.ok().headers(responseHeaders).body(timespans);
	}

	// This is the be all end all method that should take in any number of file
	// names and analyzers, plus live option and return a file
	@GetMapping("/analyze")
	@ResponseBody
	public ResponseEntity<Resource> handleFileRequest(
			@RequestParam(value = "inputFiles", required = true) String[] inputFiles,
			@RequestParam(value = "inputColumns", required = true) String[] inputColumns,
			@RequestParam(value = "outputFiles", required = false) String[] outputFiles,
			@RequestParam(value = "analyzer", required = false) String[] analyzer,
			@RequestParam(value = "liveOptions", required = false) String[] liveOptions) throws InterruptedException {

		// Catch exceptions first
		if (inputFiles == null || inputFiles.length == 0) {
			throw new IllegalArgumentException("No input files selected");
		}

		// If no output files are selected, give it a single
		if (outputFiles == null || outputFiles.length == 0) {
			// Set output files to empty string
			outputFiles = new String[10];
		}
		
		// For all of the input and output files, add the root location to the front
		for (int i = 0; i < inputFiles.length; i++) {
			inputFiles[i] = storageService.getRootLocation().toString() + "/" + storageService.getTypeFolder(inputFiles[i]) + "/" + inputFiles[i];
		}
		for (int i = 0; i < outputFiles.length; i++) {
			outputFiles[i] = storageService.getRootLocation().toString() + "/" + storageService.getTypeFolder(outputFiles[i]) + "/" + outputFiles[i];
		}

		// Then run the selected analyzer
		if (analyzer != null && analyzer.length != 0 && analyzer[0] != null) {
			try {
				Analyzer.createAnalyzer(analyzer[0], inputFiles, inputColumns, outputFiles,
						(Object[]) Arrays.copyOfRange(analyzer, 1, analyzer.length)).analyze();
			} catch (Exception e) {
				System.out.println(e);
			}
		} else {
			// If no analyzer is selected, only one file is selected, copy it
			// storageService.copyFile(inputFiles[0], outputFiles[outputFiles.length - 1]);
			outputFiles[outputFiles.length - 1] = inputFiles[0];
		}

		// TODO: THIS SHOULD HAPPEN BEFORE RUNNING THE ANALYZER IN THE COMMON CASE
		// Then check if live is true, and set the options + files accordingly
		String fileOutputString = outputFiles[outputFiles.length - 1].substring(13, outputFiles[outputFiles.length - 1].length());

		// print live options
		System.out.println("Live options: " + liveOptions[0]);

		if (liveOptions[0].equals("true")) {
			outputFiles = new String[10];
			// When live is true, we only want a certain amount of time from its timestamp
			// Get the last timestamp, then subtract a certain amount of time, and use split analyzer between the two
			int lastPoint = Integer.valueOf(storageService.getLast(fileOutputString));
			int firstPoint = Math.max(0, lastPoint - 3000);

			// print the two values
			System.out.println("First point: " + firstPoint);
			System.out.println("Last point: " + lastPoint);

			Object[] extraValues = new Object[]{String.valueOf(firstPoint), String.valueOf(lastPoint)};
			String[] lastFile = new String[]{fileOutputString};

			try {
				Analyzer.createAnalyzer("split", lastFile, inputColumns, 
					outputFiles, extraValues).analyze();
			} catch (Exception e) {
				System.out.println(e);
			}
			
		}

		// Then return the final file, removing the prefix for upload dir
		String filePath = outputFiles[outputFiles.length - 1];
		Path path = Paths.get(filePath);
		Path newPath = path.subpath(2, path.getNameCount());

		Resource file = storageService.loadAsResource(newPath.toString());

		// Set these headers so that you can access from LocalHost and download the file
		HttpHeaders responseHeaders = new HttpHeaders();
		Path absoluteFilePath = storageService.load(newPath.toString());
		String relativePath = storageService.getRootLocation().relativize(absoluteFilePath).toString();
		responseHeaders.add(HttpHeaders.CONTENT_DISPOSITION,
				"attachment; filename=\"" + relativePath + "\"");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, "Content-Disposition");

		return ResponseEntity.ok().headers(responseHeaders).body(file);
	}

	// This next method is for live data! Ideally you can feed it any of the basic
	// filenames that the car might output
	// And this will send the csv right back! Neat, huh?
	@GetMapping("/live/{filename:.+}")
	@ResponseBody
	public ResponseEntity<Resource> serveLiveFile(@PathVariable String filename) {

		filename = "live_" + filename;

		Resource file = storageService.loadAsResource(filename);

		HttpHeaders responseHeaders = new HttpHeaders();

		responseHeaders.add(HttpHeaders.CONTENT_DISPOSITION,
				"attachment; filename=\"" + file.getFilename() + "\"");
		// Set these headers so that you can access from LocalHost
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

		return ResponseEntity.ok().headers(responseHeaders).body(file);
	}

	@GetMapping("/deleteAll")
	@ResponseBody
	public ResponseEntity<String> deleteAll() {
		storageService.deleteAll();
		storageService.init();

		HttpHeaders responseHeaders = new HttpHeaders();
		// Set these headers so that you can access from LocalHost
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

		return ResponseEntity.ok().headers(responseHeaders).body("All files deleted");
	}

	// Method to get the maximum and minimum values of a column in a file
	@GetMapping("/files/maxmin/**")
	@ResponseBody
	public ResponseEntity<String> getMaxMin(HttpServletRequest request, @RequestParam(value = "headerName", required = true) String headerName) throws IOException{

		String filename = (String) request.getAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE);
    	filename = filename.substring("/files/maxmin/csv/".length());
		// Decode to add spaces back in and special characters
		filename = URLDecoder.decode(filename, StandardCharsets.UTF_8);
		
		System.out.println("Getting max and min for " + headerName + " in " + filename);
		//Set these headers so that you can access from LocalHost
		HttpHeaders responseHeaders = new HttpHeaders();
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

		// Get size, headers, datetime, etc.
		String maxmin = storageService.getMaxMin(filename, headerName);

		return ResponseEntity.ok().headers(responseHeaders).body(maxmin);
	}

	//This is the method that uploads the file
	@PostMapping("/")
	public String handleFileUpload(@RequestParam("file") MultipartFile file,
			RedirectAttributes redirectAttributes) {

		String filename = file.getOriginalFilename();
		if (filename == null) {
			throw new IllegalArgumentException("No file selected");
		}
		if (filename.substring(filename.lastIndexOf(".") + 1).equals("bin")) {
			storageService.store(file);
			String csvFilename = storageService.load(filename).toAbsolutePath().toString();
			String csvOutputDir = storageService.load("").toAbsolutePath().toString() + "\\";
			BinaryTOCSV.toCSV(csvFilename, csvOutputDir, false);
			storageService.delete(filename);
		} else {
			storageService.store(file);
		}

		redirectAttributes.addFlashAttribute("message",
				"You successfully uploaded " + file.getOriginalFilename() + "!");

		return "redirect:/";
	}

	// Upload file without redirect
	@PostMapping("/upload")
	public ResponseEntity<String> handleFileUploadAPI(@RequestParam("file") MultipartFile file) {

		// Check type of file, either CSV or bin
		String filename = file.getOriginalFilename();
		if (filename == null) {
			throw new IllegalArgumentException("No file selected");
		}
		if (filename.substring(filename.lastIndexOf(".") + 1).equals("bin")) {
			storageService.store(file);
			BinaryTOCSV.toCSV(storageService.load(filename).toAbsolutePath().toString(),
					storageService.load("").toAbsolutePath().toString() + "\\", true);
			storageService.delete(filename);
		} else if (filename.substring(filename.lastIndexOf(".") + 1).toLowerCase().equals("mov")) {
			storageService.store(file);
			storageService.copyFile(filename, filename.substring(0, filename.lastIndexOf(".")) + ".mp4");
			storageService.delete(filename);
		} else {
			storageService.store(file);
		}

		// Set these headers so that you can access from LocalHost
		HttpHeaders responseHeaders = new HttpHeaders();
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

		return ResponseEntity.ok().headers(responseHeaders)
				.body(String.format("%s uploaded", file.getOriginalFilename()));
	}

	// This method lets the backend know to collect live data and from which port
	@PostMapping("/live")
	public ResponseEntity<String> handleLive(@RequestParam(name = "port", required = false) String port) {
		// Start the live data collection

		// call the readLive function in Serial.java
		if (Serial.exit == false) {
			Serial.exit = true;
		} else {
			new Thread(() -> {
				Serial.readLive();
			}).start();
		}

		// Set these headers so that you can access from LocalHost
		HttpHeaders responseHeaders = new HttpHeaders();
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

		return ResponseEntity.ok().headers(responseHeaders)
				.body(String.format("Live data collection started on port %s", port));
	}

	@ExceptionHandler(StorageFileNotFoundException.class)
	public ResponseEntity<?> handleStorageFileNotFound(StorageFileNotFoundException exc) {
		return ResponseEntity.notFound().build();
	}

}