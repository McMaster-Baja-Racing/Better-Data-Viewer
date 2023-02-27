package backend.API;

/*
 * "In a production scenario, you more likely would store the files in a temporary location, 
 * a database, or perhaps a NoSQL store (such as Mongo’s GridFS). It is best to NOT load up 
 * the file system of your application with content."
 * 
 * This is probably worth considering...   buuuutttt...  I'm not going to do that.    :D
 */

import java.io.IOException;
import java.util.stream.Collectors;

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
import org.springframework.web.servlet.mvc.method.annotation.MvcUriComponentsBuilder;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import backend.API.storage.StorageFileNotFoundException;
import backend.API.storage.StorageProperties;
import backend.API.storage.StorageService;

import backend.API.binary_csv.BinaryTOCSV;
import backend.API.live.Serial;

import backend.API.analyzer.DataAnalyzer;
import backend.API.analyzer.LinearInterpolaterAnalyzer;
import backend.API.analyzer.AccelCurveAnalyzer;
import backend.API.analyzer.RollingAvgAnalyzer;


@Controller
public class FileUploadController {

	private final StorageService storageService;

	@Autowired
	public FileUploadController(StorageService storageService) {
		this.storageService = storageService;
	}

	//This is the method that shows the upload form page
	@GetMapping("/")
	public String listUploadedFiles(Model model) throws IOException {

		model.addAttribute("files", storageService.loadAll().map(
				path -> MvcUriComponentsBuilder.fromMethodName(FileUploadController.class,
						"serveFile", path.getFileName().toString()).build().toUri().toString())
				.collect(Collectors.toList()));

		return "uploadForm";
	}

	//This is the method that returns information about all the files
	@GetMapping("/files")
	@ResponseBody
	public ResponseEntity<String> listUploadedFiles() throws IOException{

		//Set these headers so that you can access from LocalHost
		HttpHeaders responseHeaders = new HttpHeaders();
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

		return ResponseEntity.ok().headers(responseHeaders).body(storageService.loadAll().map(
				path -> MvcUriComponentsBuilder.fromMethodName(FileUploadController.class,
						"serveFile", path.getFileName().toString()).build().toUri().toString().substring(28))
				.collect(Collectors.toList()).toString().substring(1).replace("]", ""));
		// I added some trims to remove the exact address of the file from the response, and the brackets
	}


	@GetMapping("/deleteAllFiles")
	@ResponseBody
	public ResponseEntity<String> deleteAllFiles() {

		storageService.deleteAll();

		//Set these headers so that you can access from LocalHost
		HttpHeaders responseHeaders = new HttpHeaders();
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

		return ResponseEntity.ok().headers(responseHeaders).body("All files deleted");

	}

	//This method returns information about a specific file, given the filename.
	//It should return the first row of the file (the header row)
	@GetMapping("/files/{filename:.+}/info")
	@ResponseBody
	public ResponseEntity<String> listUploadedFile(@PathVariable String filename) throws IOException{

		//Set these headers so that you can access from LocalHost
		HttpHeaders responseHeaders = new HttpHeaders();
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

		// Get size, headers, datetime, etc.
		String fileinfo = storageService.readHeaders(filename);

		return ResponseEntity.ok().headers(responseHeaders).body(fileinfo);
	}

	//This is the method that returns the file itself
	@GetMapping("/files/{filename:.+}")
	@ResponseBody
	public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
		// Catch the exception if the file is not found

		Resource file = storageService.loadAsResource(filename);

		HttpHeaders responseHeaders = new HttpHeaders();

    	responseHeaders.add(HttpHeaders.CONTENT_DISPOSITION,
		"attachment; filename=\"" + file.getFilename() + "\"");
		//Set these headers so that you can access from LocalHost
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

		return ResponseEntity.ok().headers(responseHeaders).body(file);

	}


	@GetMapping("/analyze/{filename:.+}")
	@ResponseBody
	public ResponseEntity<Resource> serveAnalyzedFile(@PathVariable String filename, @RequestParam(value = "analysis", required = false) String analysis) {
		// Catch the exception if the file is not found
		
		String[] analyses = analysis.split(",");
		String[] files = new String[1];
		files[0] = storageService.load(filename).toAbsolutePath().toString();
		DataAnalyzer da;
		for (String a : analyses) {
			if (a.equals("rollAvg")) {
				da = new RollingAvgAnalyzer(files);
				files = da.analyze().split(",");
				//BinaryTOCSV.convert(filename);
			}
		}

		Resource file = storageService.loadAsResource(files[0]);

		HttpHeaders responseHeaders = new HttpHeaders();

    	responseHeaders.add(HttpHeaders.CONTENT_DISPOSITION,
		"attachment; filename=\"" + file.getFilename() + "\"");
		//Set these headers so that you can access from LocalHost
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

		return ResponseEntity.ok().headers(responseHeaders).body(file);
	}

	//This method takes in two file names, and returns a single file of which is some combination of the two
	//This should most likely be adapted to merge with the above method such that it can take in a variable number of files
	@GetMapping("/filess/{primaryFile:.+}/{secondaryFile:.+}")
	@ResponseBody
	public ResponseEntity<Resource> serveFile(@PathVariable String primaryFile, @PathVariable String secondaryFile, @RequestParam(value = "analysis", required = false, defaultValue = "interpolate") String analysis) {

		// Load both files into an array
		String[] files = {storageService.load(primaryFile).toAbsolutePath().toString(), storageService.load(secondaryFile).toAbsolutePath().toString()};
		// Split the analysis string into an array of analyzers
		String[] analyses = analysis.split(",");
		String filename = "";

		// Loop through the analyzers and run them on the data
		DataAnalyzer da;
		for (int i = 0; i < analyses.length; i++) {
			if (analyses[i].equals("interpolate")) {
				// This will be used when Graham finishes this, for now skip it
			}
			else if (analyses[i].equals("AccelCurve")) {
				da = new AccelCurveAnalyzer(files);
				filename = da.analyze();
			}
		}

		filename = "AccelCurve.csv";

		Resource file = storageService.loadAsResource(filename);

		HttpHeaders responseHeaders = new HttpHeaders();

    	responseHeaders.add(HttpHeaders.CONTENT_DISPOSITION,
		"attachment; filename=\"" + file.getFilename() + "\"");
		//Set these headers so that you can access from LocalHost
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

		return ResponseEntity.ok().headers(responseHeaders).body(file);
	}

	@GetMapping("files/{primaryFile:.+}/{secondaryFile:.+}/{tertiaryFile:.+}")
	@ResponseBody
	public ResponseEntity<Resource> serveFile(@PathVariable String primaryFile, @PathVariable String secondaryFile, @PathVariable String tertiaryFile, @RequestParam(value = "analysis", required = false, defaultValue = "interpolate") String analysis) {

		// Load both files into an array
		String[] files = {storageService.load(primaryFile).toAbsolutePath().toString(), storageService.load(secondaryFile).toAbsolutePath().toString(), storageService.load(tertiaryFile).toAbsolutePath().toString()};
		// Split the analysis string into an array of analyzers
		String[] analyses = analysis.split(",");
		String filename = "";

		// Loop through the analyzers and run them on the data
		DataAnalyzer da;
		for (int i = 0; i < analyses.length; i++) {
			if (analyses[i].equals("interpolate")) {
				// This will be used when Graham finishes this, for now skip it
			} else if (analyses[i].equals("AccelCurve")) {
				da = new AccelCurveAnalyzer(files);
				filename = da.analyze();
			} else if (analyses[i].equals("XYColours")) {
				da = new LinearInterpolaterAnalyzer(files);
				files[0] = da.analyze();
				files[1] = files[2];
				DataAnalyzer da2 = new LinearInterpolaterAnalyzer(files);
				filename = da2.analyze();
			}
		}

		filename = "XYColours.csv";

		Resource file = storageService.loadAsResource(filename);

		HttpHeaders responseHeaders = new HttpHeaders();

		responseHeaders.add(HttpHeaders.CONTENT_DISPOSITION,
		"attachment; filename=\"" + file.getFilename() + "\"");
		//Set these headers so that you can access from LocalHost
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

		return ResponseEntity.ok().headers(responseHeaders).body(file);
	}


	//This next method is for live data! Ideally you can feed it any of the basic filenames that the car might output
	//And this will send the csv right back! Neat, huh?
	@GetMapping("/live/{filename:.+}")
	@ResponseBody
	public ResponseEntity<Resource> serveLiveFile(@PathVariable String filename) {

		filename = "live_" + filename;

		Resource file = storageService.loadAsResource(filename);

		HttpHeaders responseHeaders = new HttpHeaders();

		responseHeaders.add(HttpHeaders.CONTENT_DISPOSITION,
		"attachment; filename=\"" + file.getFilename() + "\"");
		//Set these headers so that you can access from LocalHost
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

		return ResponseEntity.ok().headers(responseHeaders).body(file);
	}

	@GetMapping("/deleteAll")
	@ResponseBody
	public ResponseEntity<String> deleteAll() {
		storageService.deleteAll();

		HttpHeaders responseHeaders = new HttpHeaders();
		//Set these headers so that you can access from LocalHost
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

		return ResponseEntity.ok().headers(responseHeaders).body("All files deleted");
	}

	//This is the method that uploads the file
	@PostMapping("/")
	public String handleFileUpload(@RequestParam("file") MultipartFile file,
			RedirectAttributes redirectAttributes) {

		String filename = file.getOriginalFilename();
		if (filename.substring(filename.lastIndexOf(".") + 1).equals("bin")) {
			storageService.store(file);
			BinaryTOCSV.toCSV(storageService.load(filename).toAbsolutePath().toString(), storageService.load("").toAbsolutePath().toString() + "\\", false);
			storageService.delete(filename);
		} else {
			storageService.store(file);
		}

		redirectAttributes.addFlashAttribute("message",
				"You successfully uploaded " + file.getOriginalFilename() + "!");

		return "redirect:/";
	}

	//Upload file without redirect
	@PostMapping("/upload")
	public ResponseEntity<String> handleFileUploadAPI(@RequestParam("file") MultipartFile file) {

		//Check type of file, either CSV or bin
		String filename = file.getOriginalFilename();
		if (filename.substring(filename.lastIndexOf(".") + 1).equals("bin")) {
			storageService.store(file);
			BinaryTOCSV.toCSV(storageService.load(filename).toAbsolutePath().toString(), storageService.load("").toAbsolutePath().toString() + "\\", false);
			storageService.delete(filename);
		} else {
			storageService.store(file);
		}

		//Set these headers so that you can access from LocalHost
		HttpHeaders responseHeaders = new HttpHeaders();
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");
		
		return ResponseEntity.ok().headers(responseHeaders).body(String.format("%s uploaded", file.getOriginalFilename()));
	}

	//This method lets the backend know to collect live data and from which port
	@PostMapping("/live")
	public ResponseEntity<String> handleLive(@RequestParam(name = "port", required = false) String port) {
		//Start the live data collection

		//call the readLive function in Serial.java
		if (Serial.exit == false) {
			Serial.exit = true;
		} else {
			new Thread(() -> {
				Serial.readLive();
			}).start();
		}

		//Set these headers so that you can access from LocalHost
		HttpHeaders responseHeaders = new HttpHeaders();
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

		return ResponseEntity.ok().headers(responseHeaders).body(String.format("Live data collection started on port %s", port));
	}

	@ExceptionHandler(StorageFileNotFoundException.class)
	public ResponseEntity<?> handleStorageFileNotFound(StorageFileNotFoundException exc) {
		return ResponseEntity.notFound().build();
	}

}